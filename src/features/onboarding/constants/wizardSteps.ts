import type { WizardStep } from '../types/onboardingDraft';

export const WIZARD_STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 'person', label: 'New hire', description: 'Who is joining and when' },
  { id: 'hardware', label: 'Hardware', description: 'Kit and delivery' },
  { id: 'software', label: 'Software', description: 'Licences to assign' },
  { id: 'review', label: 'Review', description: 'Confirm and start' },
];
