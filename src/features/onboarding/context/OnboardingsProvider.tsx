import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { onboardings as seedOnboardings } from '../../../data/mockData';
import { getNow } from '../../../lib/date';
import type { Onboarding } from '../../../types/onboarding';
import { useLicences } from '../../licences/hooks/useLicences';
import { useOrders } from '../../orders/hooks/useOrders';
import type { StartOnboardingInput, StartOnboardingResult } from '../types/startOnboardingInput';
import { OnboardingsContext, type OnboardingsContextValue } from './OnboardingsContext';

const REFERENCE_PREFIX = 'ONB-';

interface OnboardingsProviderProps {
  children: ReactNode;
}

/** In-memory onboardings. Must sit inside OrdersProvider and LicencesProvider. */
export function OnboardingsProvider({ children }: OnboardingsProviderProps) {
  const { placeOrder } = useOrders();
  const { changeLicences } = useLicences();
  const [onboardings, setOnboardings] = useState<Onboarding[]>(() =>
    [...seedOnboardings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  // Mirrors state synchronously so several updates in one event build on each other.
  const onboardingsRef = useRef(onboardings);
  const nextReferenceRef = useRef(
    Math.max(...seedOnboardings.map((onboarding) => Number(onboarding.reference.slice(REFERENCE_PREFIX.length)))) + 1,
  );

  const commit = useCallback((next: Onboarding[]) => {
    onboardingsRef.current = next;
    setOnboardings(next);
  }, []);

  const startOnboarding = useCallback(
    (input: StartOnboardingInput): StartOnboardingResult => {
      const referenceNo = nextReferenceRef.current++;
      const id = `onb-${referenceNo}`;

      const order = input.kit
        ? placeOrder({
            kit: input.kit,
            tenantId: input.tenantId,
            acquisition: input.acquisition,
            assignee: input.person,
            requestedBy: input.requestedBy,
            startDate: input.startDate,
            shipTo: input.shipTo,
            onboardingId: id,
          })
        : null;

      // Seats are reserved now and activate on the start date.
      const licences = changeLicences({
        tenantId: input.tenantId,
        person: input.person,
        add: input.softwareIds,
        remove: [],
        startsOn: input.startDate,
        changedBy: input.requestedBy,
      });

      const onboarding: Onboarding = {
        id,
        reference: `${REFERENCE_PREFIX}${referenceNo}`,
        tenantId: input.tenantId,
        person: input.person,
        jobTitle: input.jobTitle,
        startDate: input.startDate,
        kitId: input.kit?.id ?? null,
        orderId: order?.id ?? null,
        softwareIds: input.softwareIds,
        // Hardware being prepared = in progress; licence-only onboardings just wait for the start date.
        status: order ? 'in-progress' : 'scheduled',
        requestedBy: input.requestedBy,
        createdAt: getNow().toISOString(),
      };

      commit([onboarding, ...onboardingsRef.current]);
      return { onboarding, order, licences };
    },
    [placeOrder, changeLicences, commit],
  );

  const advanceTo = useCallback(
    (today: string, approvedOrderIds: Set<string>) => {
      const started: Onboarding[] = [];
      const next = onboardingsRef.current.map((onboarding) => {
        if (onboarding.status === 'completed') return onboarding;
        if (onboarding.startDate <= today) {
          const completed = { ...onboarding, status: 'completed' as const };
          started.push(completed);
          return completed;
        }
        if (onboarding.status === 'scheduled' && onboarding.orderId && approvedOrderIds.has(onboarding.orderId)) {
          return { ...onboarding, status: 'in-progress' as const };
        }
        return onboarding;
      });
      if (next.some((onboarding, index) => onboarding !== onboardingsRef.current[index])) commit(next);
      return started;
    },
    [commit],
  );

  const value = useMemo<OnboardingsContextValue>(
    () => ({ onboardings, startOnboarding, advanceTo }),
    [onboardings, startOnboarding, advanceTo],
  );

  return <OnboardingsContext value={value}>{children}</OnboardingsContext>;
}
