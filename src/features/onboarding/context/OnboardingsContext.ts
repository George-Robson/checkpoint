import { createContext } from 'react';
import type { Onboarding } from '../../../types/onboarding';
import type { StartOnboardingInput, StartOnboardingResult } from '../types/startOnboardingInput';

export interface OnboardingsContextValue {
  /** All onboardings across tenants, newest first. */
  onboardings: Onboarding[];
  /** Orders the kit (if any) and schedules the licences for the start date. */
  startOnboarding: (input: StartOnboardingInput) => StartOnboardingResult;
  /**
   * Applies everything due by `today`: new hires whose start date has arrived have started, and
   * onboardings whose hardware order was just approved move into preparation.
   */
  advanceTo: (today: string, approvedOrderIds: Set<string>) => Onboarding[];
}

export const OnboardingsContext = createContext<OnboardingsContextValue | null>(null);
