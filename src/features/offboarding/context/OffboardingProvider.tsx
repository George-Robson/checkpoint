import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { offboardingRequests as seedRequests } from '../../../data/mockData';
import { addDays, getNow, parseDate, toIsoDate } from '../../../lib/date';
import type { OffboardingRequest } from '../../../types/offboarding';
import { useDevices } from '../../devices/hooks/useDevices';
import { useLicences } from '../../licences/hooks/useLicences';
import type { SubmitOffboardingInput } from '../types/submitOffboardingInput';
import { startsImmediately } from '../utils/startsImmediately';
import { OffboardingContext, type OffboardingAdvanceResult, type OffboardingContextValue } from './OffboardingContext';

const REFERENCE_PREFIX = 'OFF-';

/** Licences are kept this long after the last day so mail and files stay recoverable. */
export const LICENCE_RETENTION_DAYS = 30;

/** Days from the last working day until wipes are confirmed and returns collected (mock). */
const WRAP_UP_DAYS = 5;

function dateAfter(isoDate: string, days: number): string {
  return toIsoDate(addDays(parseDate(isoDate), days));
}

interface OffboardingProviderProps {
  children: ReactNode;
}

/**
 * In-memory offboarding requests. Must sit inside DevicesProvider and LicencesProvider: requests start
 * device wipes, schedule licence release, and return or reassign devices when complete.
 */
export function OffboardingProvider({ children }: OffboardingProviderProps) {
  const { setDeviceStatus, removeDevices, unassignDevices } = useDevices();
  const { scheduleRelease } = useLicences();
  const [requests, setRequests] = useState<OffboardingRequest[]>(() =>
    [...seedRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  // Mirrors state synchronously so several updates in one event build on each other.
  const requestsRef = useRef(requests);
  const nextReferenceRef = useRef(
    Math.max(...seedRequests.map((request) => Number(request.reference.slice(REFERENCE_PREFIX.length)))) + 1,
  );

  const commit = useCallback((next: OffboardingRequest[]) => {
    requestsRef.current = next;
    setRequests(next);
  }, []);

  const startWipes = useCallback(
    (request: OffboardingRequest) => {
      const wiped = request.deviceActions
        .filter((deviceAction) => deviceAction.action !== 'retain')
        .map((deviceAction) => deviceAction.deviceId);
      setDeviceStatus(wiped, 'wiping');
    },
    [setDeviceStatus],
  );

  const submitOffboarding = useCallback(
    (input: SubmitOffboardingInput): OffboardingRequest => {
      const referenceNo = nextReferenceRef.current++;
      const startsNow = startsImmediately(input.accessRevocation, input.lastWorkingDay);
      const releasesLicences = input.accountActions.includes('remove-licences');
      const licencesEndOn = releasesLicences ? dateAfter(input.lastWorkingDay, LICENCE_RETENTION_DAYS) : null;

      const request: OffboardingRequest = {
        ...input,
        id: `off-${referenceNo}`,
        reference: `${REFERENCE_PREFIX}${referenceNo}`,
        status: startsNow ? 'in-progress' : 'scheduled',
        licencesEndOn,
        createdAt: getNow().toISOString(),
      };

      if (startsNow) startWipes(request);
      if (licencesEndOn) scheduleRelease(input.tenantId, input.employee, licencesEndOn);

      commit([request, ...requestsRef.current]);
      return request;
    },
    [startWipes, scheduleRelease, commit],
  );

  const advanceTo = useCallback(
    (today: string): OffboardingAdvanceResult => {
      const result: OffboardingAdvanceResult = { started: [], completed: [], devicesReturned: 0 };

      const next = requestsRef.current.map((original) => {
        let request = original;

        if (request.status === 'scheduled' && request.lastWorkingDay <= today) {
          request = { ...request, status: 'in-progress' };
          startWipes(request);
          result.started.push(request);
        }

        if (request.status === 'in-progress' && dateAfter(request.lastWorkingDay, WRAP_UP_DAYS) <= today) {
          request = { ...request, status: 'completed' };
          const returned = request.deviceActions.filter((d) => d.action === 'wipe-return').map((d) => d.deviceId);
          const reassigned = request.deviceActions.filter((d) => d.action === 'wipe-reassign').map((d) => d.deviceId);
          removeDevices(returned);
          unassignDevices(reassigned);
          result.devicesReturned += returned.length;
          result.completed.push(request);
        }
        return request;
      });

      if (result.started.length || result.completed.length) commit(next);
      return result;
    },
    [startWipes, removeDevices, unassignDevices, commit],
  );

  const value = useMemo<OffboardingContextValue>(
    () => ({ requests, submitOffboarding, advanceTo }),
    [requests, submitOffboarding, advanceTo],
  );

  return <OffboardingContext value={value}>{children}</OffboardingContext>;
}
