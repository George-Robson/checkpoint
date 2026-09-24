import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { licenceAssignments as seedAssignments, licencePools as seedPools } from '../../../data/mockData';
import { getNow } from '../../../lib/date';
import type { LicenceChange } from '../types/licenceChange';
import { applyLicenceChange, type LicenceState } from '../utils/applyLicenceChange';
import { LicencesContext, type LicencesContextValue } from './LicencesContext';

interface LicencesProviderProps {
  children: ReactNode;
}

/** In-memory seat pools and assignments: seeded from mock data, changes last until reload. */
export function LicencesProvider({ children }: LicencesProviderProps) {
  const [state, setState] = useState<LicenceState>({ pools: seedPools, assignments: seedAssignments });
  // Mirrors state synchronously so back-to-back changes in one event build on each other.
  const stateRef = useRef(state);
  const nextIdRef = useRef(1);

  const commit = useCallback((next: LicenceState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const changeLicences = useCallback(
    (change: LicenceChange) => {
      const outcome = applyLicenceChange(stateRef.current, change, getNow(), () => `la-new-${nextIdRef.current++}`);
      commit(outcome.state);
      return outcome.result;
    },
    [commit],
  );

  const setPoolSeats = useCallback(
    (poolId: string, seats: number) => {
      const current = stateRef.current;
      const pool = current.pools.find((candidate) => candidate.id === poolId);
      if (!pool) return;
      const used = current.assignments.filter(
        (a) => a.tenantId === pool.tenantId && a.softwareId === pool.softwareId,
      ).length;
      commit({
        ...current,
        pools: current.pools.map((candidate) =>
          candidate.id === poolId ? { ...candidate, seats: Math.max(used, seats) } : candidate,
        ),
      });
    },
    [commit],
  );

  const value = useMemo<LicencesContextValue>(
    () => ({ pools: state.pools, assignments: state.assignments, changeLicences, setPoolSeats }),
    [state, changeLicences, setPoolSeats],
  );

  return <LicencesContext value={value}>{children}</LicencesContext>;
}
