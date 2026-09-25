import { Card } from '../../../components/ui/Card';
import type { Alert } from '../../../types/alert';
import type { BackupJob } from '../../../types/backup';
import type { DeviceHealthEntry } from '../hooks/useFleetHealth';
import { patchCompliance } from '../utils/deviceHealth';

interface HealthSummaryProps {
  entries: DeviceHealthEntry[];
  backups: BackupJob[];
  alerts: Alert[];
}

function percent(share: number | null): string {
  return share === null ? '—' : `${Math.round(share * 100)}%`;
}

/** Headline health, patching, protection and backup figures for the current scope. */
export function HealthSummary({ entries, backups, alerts }: HealthSummaryProps) {
  const monitored = entries.filter((entry) => entry.assessment.level !== 'unmonitored');
  const healthy = monitored.filter((entry) => entry.assessment.level === 'healthy').length;
  const critical = monitored.filter((entry) => entry.assessment.level === 'critical').length;
  const agents = monitored.filter((entry) => entry.health.edr !== 'not-applicable');
  const protectedDevices = agents.filter((entry) => entry.health.edr === 'active' && entry.health.encryption === 'encrypted').length;
  const failingBackups = backups.filter((job) => job.recent.status === 'failed').length;
  const partialBackups = backups.filter((job) => job.recent.status === 'warning').length;

  const stats = [
    {
      label: 'Healthy devices',
      value: `${healthy} / ${monitored.length}`,
      detail: critical ? `${critical} critical · ${monitored.length - healthy - critical} need attention` : `${monitored.length - healthy} need attention`,
      danger: critical > 0,
    },
    {
      label: 'Patch compliance',
      value: percent(patchCompliance(entries)),
      detail: 'Devices fully up to date',
    },
    {
      label: 'Protected computers & servers',
      value: `${protectedDevices} / ${agents.length}`,
      detail: 'EDR active and disk encrypted',
      danger: protectedDevices < agents.length,
    },
    {
      label: 'Backups',
      value: `${backups.length - failingBackups - partialBackups} / ${backups.length}`,
      detail: failingBackups || partialBackups ? `${failingBackups} failing · ${partialBackups} partial` : 'All jobs succeeding',
      danger: failingBackups > 0,
    },
    {
      label: 'Open alerts',
      value: `${alerts.length}`,
      detail: `${alerts.filter((alert) => alert.severity === 'critical').length} critical`,
      danger: alerts.some((alert) => alert.severity === 'critical'),
    },
  ];

  return (
    <Card>
      <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-5 xl:divide-x">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4">
            <dt className="text-sm text-slate-500">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-900">{stat.value}</dd>
            <dd className={stat.danger ? 'mt-0.5 text-xs text-rose-700' : 'mt-0.5 text-xs text-slate-500'}>{stat.detail}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
