import { createContext } from 'react';
import type { OffboardingRequest } from '../../../types/offboarding';
import type { SubmitOffboardingInput } from '../types/submitOffboardingInput';

export interface OffboardingAdvanceResult {
  /** Scheduled offboardings whose last working day arrived: access revoked, wipes started. */
  started: OffboardingRequest[];
  /** Offboardings whose wipes and returns are done. */
  completed: OffboardingRequest[];
  /** Devices returned to Checkpoint (removed from the fleet). */
  devicesReturned: number;
}

export interface OffboardingContextValue {
  /** All requests across tenants, newest first. */
  requests: OffboardingRequest[];
  submitOffboarding: (input: SubmitOffboardingInput) => OffboardingRequest;
  /** Applies everything due by `today` (see OffboardingAdvanceResult). */
  advanceTo: (today: string) => OffboardingAdvanceResult;
}

export const OffboardingContext = createContext<OffboardingContextValue | null>(null);
