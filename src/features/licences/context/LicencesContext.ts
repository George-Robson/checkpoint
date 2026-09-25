import { createContext } from 'react';
import type { LicenceAssignment, LicencePool } from '../../../types/licence';
import type { LicenceBundle } from '../../../types/licenceBundle';
import type { LicenceChange, LicenceChangeResult } from '../types/licenceChange';

export interface LicenceAdvanceResult {
  /** New hires' licences that became active. */
  activated: number;
  /** Leavers' licences whose end date passed; their seats are free again. */
  released: number;
}

export type BundleDraft = Pick<LicenceBundle, 'tenantId' | 'name' | 'description' | 'softwareIds'>;

export interface LicencesContextValue {
  pools: LicencePool[];
  assignments: LicenceAssignment[];
  /** Software every person at a client gets, keyed by tenant id. */
  baselines: Record<string, string[]>;
  /** Client-made licence bundles. */
  bundles: LicenceBundle[];
  /** Grants and/or removes licences for one person; buys seats where a pool is full. */
  changeLicences: (change: LicenceChange) => LicenceChangeResult;
  /** Resizes a pool (never below the seats in use). */
  setPoolSeats: (poolId: string, seats: number) => void;
  setBaseline: (tenantId: string, softwareIds: string[]) => void;
  /** Creates a bundle, or updates it when `bundleId` is given. */
  saveBundle: (draft: BundleDraft, options: { bundleId?: string; editorName: string }) => LicenceBundle;
  deleteBundle: (bundleId: string) => void;
  /** Marks all of a leaver's licences to end on a date (seats stay in use until then). */
  scheduleRelease: (tenantId: string, person: string, endsOn: string) => number;
  /** Applies everything due by `today`: scheduled licences activate, ended ones are released. */
  advanceTo: (today: string) => LicenceAdvanceResult;
}

export const LicencesContext = createContext<LicencesContextValue | null>(null);
