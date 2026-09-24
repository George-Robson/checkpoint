export type WizardStep = 'person' | 'hardware' | 'software' | 'review';

/** Chosen in the hardware step when the new hire needs no kit. */
export const NO_KIT = 'none';

export interface OnboardingDraft {
  tenantId: string;
  person: string;
  jobTitle: string;
  startDate: string;
  /** '' until chosen; NO_KIT for none; otherwise a client kit id. */
  kitId: string;
  shipTo: string;
  /** Extra software beyond the client's baseline (baseline is always included). */
  softwareIds: string[];
}

export type OnboardingDraftErrors = Partial<Record<'tenantId' | 'person' | 'startDate' | 'kitId' | 'shipTo', string>>;
