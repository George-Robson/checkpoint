import type { Onboarding } from '../../../types/onboarding';
import type { Order } from '../../../types/order';
import type { ClientKit } from '../../kits/utils/isClientKit';
import type { LicenceChangeResult } from '../../licences/types/licenceChange';

export interface StartOnboardingInput {
  tenantId: string;
  person: string;
  jobTitle: string;
  startDate: string;
  /** null = no hardware (existing or personal device). */
  kit: ClientKit | null;
  shipTo: string;
  softwareIds: string[];
  requestedBy: string;
}

export interface StartOnboardingResult {
  onboarding: Onboarding;
  order: Order | null;
  licences: LicenceChangeResult;
}
