import type { Acquisition } from './acquisition';

export type TenantPlan = 'Essentials' | 'Professional' | 'Enterprise';

export interface Tenant {
  id: string;
  name: string;
  shortCode: string;
  domain: string;
  industry: string;
  plan: TenantPlan;
  primaryContact: string;
  region: string;
  seats: number;
  onboardedAt: string;
  /** Software every person at this client is licensed for (always included in onboarding). */
  baselineSoftwareIds: string[];
  /** Pre-selected when ordering hardware; can be changed per order. */
  hardwarePreference: Acquisition;
}
