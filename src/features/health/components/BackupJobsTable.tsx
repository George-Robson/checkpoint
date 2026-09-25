import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/cn';
import { addDays, formatDate, parseDate, toIsoDate } from '../../../lib/date';
import type { BackupJob } from '../../../types/backup';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { BACKUP_KIND_LABEL, BACKUP_STATUS_META } from '../constants/healthMeta';
import { backupDays, backupSuccessRate } from '../utils/backupHistory';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

/** Days of history shown as a strip per job. */
const HISTORY_DAYS = 14;

const DAY_CLASSES = { success: 'bg-emerald-500', warning: 'bg-amber-400', failed: 'bg-rose-500' };

interface BackupJobsTableProps {
  jobs: BackupJob[];
  today: string;
  showTenant: boolean;
}

export function BackupJobsTable({ jobs, today, showTenant }: BackupJobsTableProps) {
  const from = toIsoDate(addDays(parseDate(today), -(HISTORY_DAYS - 1)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Backup
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={HEADER_CELL}>
              Latest run
            </th>
            <th scope="col" className={HEADER_CELL}>
              Last {HISTORY_DAYS} days
            </th>
            <th scope="col" className={HEADER_CELL}>
              Schedule
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Protected
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => {
            const days = backupDays(job, from, today, today);
            const rate = backupSuccessRate(days);
            const { label, tone } = BACKUP_STATUS_META[job.recent.status];
            return (
              <tr key={job.id} className="hover:bg-slate-50">
                <td className={CELL}>
                  <p className="whitespace-nowrap font-medium text-slate-900">{job.name}</p>
                  <p className="whitespace-nowrap text-xs text-slate-500">
                    {BACKUP_KIND_LABEL[job.kind]} · {job.scope}
                  </p>
                </td>
                {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(job.tenantId)}</td>}
                <td className={CELL}>
                  <Badge tone={tone}>{label}</Badge>
                  {job.recent.message && <p className="mt-1 max-w-64 text-xs text-slate-500">{job.recent.message}</p>}
                  {job.recent.status !== 'success' && job.recent.runs > 1 && (
                    <p className="mt-0.5 text-xs text-slate-500">For the last {job.recent.runs} days</p>
                  )}
                </td>
                <td className={CELL}>
                  <div className="flex items-center gap-0.5" aria-label={`${Math.round((rate ?? 0) * 100)}% of days fully successful`}>
                    {days.map((day) => (
                      <span
                        key={day.date}
                        title={`${formatDate(day.date)}: ${BACKUP_STATUS_META[day.status].label}`}
                        className={cn('h-4 w-1.5 rounded-sm', DAY_CLASSES[day.status])}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs tabular-nums text-slate-500">{Math.round((rate ?? 0) * 100)}% successful</p>
                </td>
                <td className={CELL}>
                  <p className="whitespace-nowrap text-slate-700">{job.schedule}</p>
                  <p className="whitespace-nowrap text-xs text-slate-500">Kept {job.retentionDays >= 365 ? `${Math.round(job.retentionDays / 365)} years` : `${job.retentionDays} days`}</p>
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-700')}>
                  {job.protectedGb >= 1000 ? `${(job.protectedGb / 1000).toFixed(1)} TB` : `${job.protectedGb} GB`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
