import type { Tone } from '../../../components/ui/tone';
import type { AccountStage } from '../types/creditControl';

export const ACCOUNT_STAGE_META: Record<AccountStage, { label: string; tone: Tone }> = {
  'good-standing': { label: 'Good standing', tone: 'emerald' },
  overdue: { label: 'Overdue', tone: 'amber' },
  'on-hold': { label: 'On hold', tone: 'amber' },
  'final-notice': { label: 'Final notice', tone: 'rose' },
  suspended: { label: 'Suspended', tone: 'rose' },
};
