import type { Tone } from '../../../components/ui/tone';
import type { OffboardingStatus } from '../../../types/offboarding';

interface OffboardingStatusMeta {
  label: string;
  tone: Tone;
}

export const OFFBOARDING_STATUS_META: Record<OffboardingStatus, OffboardingStatusMeta> = {
  scheduled: { label: 'Scheduled', tone: 'slate' },
  'in-progress': { label: 'In progress', tone: 'amber' },
  completed: { label: 'Completed', tone: 'emerald' },
};
