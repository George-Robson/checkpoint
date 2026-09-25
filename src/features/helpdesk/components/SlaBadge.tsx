import { Badge } from '../../../components/ui/Badge';
import type { Tone } from '../../../components/ui/tone';
import type { SlaClock } from '../utils/ticketSla';
import { formatMinutes } from '../utils/ticketSla';

const TONES: Record<SlaClock['status'], Tone> = {
  met: 'emerald',
  breached: 'rose',
  'at-risk': 'amber',
  'on-track': 'slate',
};

interface SlaBadgeProps {
  kind: 'response' | 'resolution';
  clock: SlaClock;
}

/** e.g. "Response due in 12m", "Resolution 3h 5m overdue", "Resolved within SLA". */
export function SlaBadge({ kind, clock }: SlaBadgeProps) {
  const noun = kind === 'response' ? 'Response' : 'Resolution';
  let text: string;
  if (clock.minutesLeft === null) {
    text = clock.status === 'met' ? `${noun} within SLA` : `${noun} missed SLA`;
  } else if (clock.minutesLeft < 0) {
    text = `${noun} ${formatMinutes(clock.minutesLeft)} overdue`;
  } else {
    text = `${noun} due in ${formatMinutes(clock.minutesLeft)}`;
  }
  return <Badge tone={TONES[clock.status]}>{text}</Badge>;
}
