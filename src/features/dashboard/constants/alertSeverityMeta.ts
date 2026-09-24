import { Info, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { Tone } from '../../../components/ui/tone';
import type { AlertSeverity } from '../../../types/alert';

interface AlertSeverityMeta {
  label: string;
  tone: Tone;
  icon: LucideIcon;
  iconClassName: string;
  /** Lower sorts first. */
  rank: number;
}

export const ALERT_SEVERITY_META: Record<AlertSeverity, AlertSeverityMeta> = {
  critical: { label: 'Critical', tone: 'rose', icon: OctagonAlert, iconClassName: 'text-rose-600', rank: 0 },
  warning: { label: 'Warning', tone: 'amber', icon: TriangleAlert, iconClassName: 'text-amber-600', rank: 1 },
  info: { label: 'Info', tone: 'slate', icon: Info, iconClassName: 'text-slate-400', rank: 2 },
};
