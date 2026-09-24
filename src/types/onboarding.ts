export type OnboardingStatus = 'scheduled' | 'in-progress' | 'completed';

/** A new hire being set up: optional hardware kit plus software licences. */
export interface Onboarding {
  id: string;
  reference: string;
  tenantId: string;
  person: string;
  jobTitle: string;
  startDate: string;
  /** null when no hardware was ordered (existing or personal device). */
  kitId: string | null;
  orderId: string | null;
  softwareIds: string[];
  status: OnboardingStatus;
  requestedBy: string;
  createdAt: string;
}
