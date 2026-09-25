import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  licenceAssignments as seedAssignments,
  licenceBundles as seedBundles,
  licencePools as seedPools,
  tenants,
} from '../../../data/mockData';
import { getNow } from '../../../lib/date';
import type { LicenceBundle } from '../../../types/licenceBundle';
import type { LicenceChange } from '../types/licenceChange';
import { applyLicenceChange, type LicenceState } from '../utils/applyLicenceChange';
import { LicencesContext, type BundleDraft, type LicencesContextValue } from './LicencesContext';

interface LicencesProviderProps {
  children: ReactNode;
}

interface StoreState extends LicenceState {
  baselines: Record<string, string[]>;
  bundles: LicenceBundle[];
}

/** In-memory seat pools, assignments and client baselines: seeded from mock data, changes last until reload. */
export function LicencesProvider({ children }: LicencesProviderProps) {
  const [state, setState] = useState<StoreState>(() => ({
    pools: seedPools,
    assignments: seedAssignments,
    baselines: Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.baselineSoftwareIds])),
    bundles: seedBundles,
  }));
  // Mirrors state synchronously so back-to-back changes in one event build on each other.
  const stateRef = useRef(state);
  const nextIdRef = useRef(1);
  const nextBundleIdRef = useRef(1);

  const commit = useCallback((next: StoreState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const changeLicences = useCallback(
    (change: LicenceChange) => {
      const current = stateRef.current;
      const outcome = applyLicenceChange(current, change, getNow(), () => `la-new-${nextIdRef.current++}`);
      commit({ ...current, ...outcome.state });
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

  const setBaseline = useCallback(
    (tenantId: string, softwareIds: string[]) => {
      const current = stateRef.current;
      commit({ ...current, baselines: { ...current.baselines, [tenantId]: softwareIds } });
    },
    [commit],
  );

  const saveBundle = useCallback(
    (draft: BundleDraft, { bundleId, editorName }: { bundleId?: string; editorName: string }) => {
      const current = stateRef.current;
      const saved: LicenceBundle = {
        ...draft,
        id: bundleId ?? `bdl-custom-${nextBundleIdRef.current++}`,
        updatedAt: getNow().toISOString(),
        updatedBy: editorName,
      };
      const bundles = bundleId
        ? current.bundles.map((bundle) => (bundle.id === bundleId ? saved : bundle))
        : [...current.bundles, saved];
      commit({ ...current, bundles });
      return saved;
    },
    [commit],
  );

  const deleteBundle = useCallback(
    (bundleId: string) => {
      const current = stateRef.current;
      commit({ ...current, bundles: current.bundles.filter((bundle) => bundle.id !== bundleId) });
    },
    [commit],
  );

  const scheduleRelease = useCallback(
    (tenantId: string, person: string, endsOn: string) => {
      const current = stateRef.current;
      let count = 0;
      const assignments = current.assignments.map((assignment) => {
        if (assignment.tenantId !== tenantId || assignment.person !== person) return assignment;
        count += 1;
        return { ...assignment, endsOn };
      });
      commit({ ...current, assignments });
      return count;
    },
    [commit],
  );

  const advanceTo = useCallback(
    (today: string) => {
      const current = stateRef.current;
      let activated = 0;
      let released = 0;
      const assignments = current.assignments.flatMap((assignment) => {
        if (assignment.endsOn && assignment.endsOn <= today) {
          released += 1;
          return [];
        }
        if (assignment.status === 'scheduled' && assignment.startsOn && assignment.startsOn <= today) {
          activated += 1;
          return [{ ...assignment, status: 'active' as const }];
        }
        return [assignment];
      });
      if (activated || released) commit({ ...current, assignments });
      return { activated, released };
    },
    [commit],
  );

  const value = useMemo<LicencesContextValue>(
    () => ({
      pools: state.pools,
      assignments: state.assignments,
      baselines: state.baselines,
      bundles: state.bundles,
      changeLicences,
      setPoolSeats,
      setBaseline,
      saveBundle,
      deleteBundle,
      scheduleRelease,
      advanceTo,
    }),
    [state, changeLicences, setPoolSeats, setBaseline, saveBundle, deleteBundle, scheduleRelease, advanceTo],
  );

  return <LicencesContext value={value}>{children}</LicencesContext>;
}
