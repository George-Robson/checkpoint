import type { Acquisition } from '../../../types/acquisition';
import type { Kit } from '../../../types/kit';

export interface PlaceOrderInput {
  kit: Kit;
  tenantId: string;
  acquisition: Acquisition;
  assignee: string;
  requestedBy: string;
  startDate: string;
  shipTo: string;
  notes?: string;
  /** Links the order to the onboarding that raised it. */
  onboardingId?: string;
}
