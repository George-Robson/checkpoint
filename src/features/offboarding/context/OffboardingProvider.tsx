import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { offboardingRequests as seedRequests } from '../../../data/mockData';
import { getNow } from '../../../lib/date';
import type { OffboardingRequest } from '../../../types/offboarding';
import { useDevices } from '../../devices/hooks/useDevices';
import type { SubmitOffboardingInput } from '../types/submitOffboardingInput';
import { startsImmediately } from '../utils/startsImmediately';
import { OffboardingContext, type OffboardingContextValue } from './OffboardingContext';

const REFERENCE_PREFIX = 'OFF-';

interface OffboardingProviderProps {
  children: ReactNode;
}

/** In-memory offboarding requests. Must sit inside DevicesProvider: immediate requests start device wipes. */
export function OffboardingProvider({ children }: OffboardingProviderProps) {
  const { setDeviceStatus } = useDevices();
  const [requests, setRequests] = useState<OffboardingRequest[]>(() =>
    [...seedRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  const nextReferenceRef = useRef(
    Math.max(...seedRequests.map((request) => Number(request.reference.slice(REFERENCE_PREFIX.length)))) + 1,
  );

  const submitOffboarding = useCallback(
    (input: SubmitOffboardingInput): OffboardingRequest => {
      const referenceNo = nextReferenceRef.current++;
      const startsNow = startsImmediately(input.accessRevocation, input.lastWorkingDay);

      const request: OffboardingRequest = {
        ...input,
        id: `off-${referenceNo}`,
        reference: `${REFERENCE_PREFIX}${referenceNo}`,
        status: startsNow ? 'in-progress' : 'scheduled',
        createdAt: getNow().toISOString(),
      };

      if (startsNow) {
        const wipedDeviceIds = input.deviceActions
          .filter((deviceAction) => deviceAction.action !== 'retain')
          .map((deviceAction) => deviceAction.deviceId);
        setDeviceStatus(wipedDeviceIds, 'wiping');
      }

      setRequests((previous) => [request, ...previous]);
      return request;
    },
    [setDeviceStatus],
  );

  const value = useMemo<OffboardingContextValue>(
    () => ({ requests, submitOffboarding }),
    [requests, submitOffboarding],
  );

  return <OffboardingContext value={value}>{children}</OffboardingContext>;
}
