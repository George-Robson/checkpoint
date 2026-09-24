import { createContext } from 'react';
import type { LicenceAssignment, LicencePool } from '../../../types/licence';
import type { LicenceChange, LicenceChangeResult } from '../types/licenceChange';

export interface LicencesContextValue {
  pools: LicencePool[];
  assignments: LicenceAssignment[];
  /** Grants and/or removes licences for one person; buys seats where a pool is full. */
  changeLicences: (change: LicenceChange) => LicenceChangeResult;
  /** Resizes a pool (never below the seats in use). */
  setPoolSeats: (poolId: string, seats: number) => void;
}

export const LicencesContext = createContext<LicencesContextValue | null>(null);
