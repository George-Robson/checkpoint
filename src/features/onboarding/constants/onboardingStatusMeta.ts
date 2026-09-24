import type { Tone } from '../../../components/ui/tone';
import type { OnboardingStatus } from '../../../types/onboarding';

interface OnboardingStatusMeta {
  label: string;
  tone: Tone;
}

export const ONBOARDING_STATUS_META: Record<OnboardingStatus, OnboardingStatusMeta> = {
  scheduled: { label: 'Scheduled', tone: 'slate' },
  'in-progress': { label: 'Preparing hardware', tone: 'amber' },
  completed: { label: 'Started', tone: 'emerald' },
};
