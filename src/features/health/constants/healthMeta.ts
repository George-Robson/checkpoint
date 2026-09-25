import type { Tone } from '../../../components/ui/tone';
import type { BackupKind, BackupRunStatus } from '../../../types/backup';
import type { HealthLevel } from '../../../types/deviceHealth';
import type { CyberEssentialsLevel, DmarcPolicy } from '../../../types/securityPosture';

export const HEALTH_LEVEL_ORDER: HealthLevel[] = ['critical', 'warning', 'healthy', 'unmonitored'];

export const HEALTH_LEVEL_META: Record<HealthLevel, { label: string; tone: Tone }> = {
  critical: { label: 'Critical', tone: 'rose' },
  warning: { label: 'Needs attention', tone: 'amber' },
  healthy: { label: 'Healthy', tone: 'emerald' },
  unmonitored: { label: 'Not monitored', tone: 'slate' },
};

export const BACKUP_STATUS_META: Record<BackupRunStatus, { label: string; tone: Tone }> = {
  success: { label: 'Succeeded', tone: 'emerald' },
  warning: { label: 'Partial', tone: 'amber' },
  failed: { label: 'Failed', tone: 'rose' },
};

export const BACKUP_KIND_LABEL: Record<BackupKind, string> = {
  'microsoft-365': 'Microsoft 365',
  'google-workspace': 'Google Workspace',
  server: 'On-site server',
  'cloud-server': 'Cloud server',
};

export const CYBER_ESSENTIALS_LABEL: Record<CyberEssentialsLevel, string> = {
  'cyber-essentials': 'Cyber Essentials',
  'cyber-essentials-plus': 'Cyber Essentials Plus',
};

export const DMARC_META: Record<DmarcPolicy, { label: string; tone: Tone }> = {
  reject: { label: 'Enforced (reject)', tone: 'emerald' },
  quarantine: { label: 'Quarantine', tone: 'amber' },
  none: { label: 'Monitoring only', tone: 'rose' },
};
