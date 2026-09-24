import { createContext } from 'react';
import type { OffboardingRequest } from '../../../types/offboarding';
import type { SubmitOffboardingInput } from '../types/submitOffboardingInput';

export interface OffboardingContextValue {
  /** All requests across tenants, newest first. */
  requests: OffboardingRequest[];
  submitOffboarding: (input: SubmitOffboardingInput) => OffboardingRequest;
}

export const OffboardingContext = createContext<OffboardingContextValue | null>(null);
