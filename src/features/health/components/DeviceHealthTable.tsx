import { HeartPulse, Lock, LockOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { formatDate, formatDateTime, formatRelativeTime } from '../../../lib/date';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { HEALTH_LEVEL_META } from '../constants/healthMeta';
import type { DeviceHealthEntry } from '../hooks/useFleetHealth';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface DeviceHealthTableProps {
  entries: DeviceHealthEntry[];
  showTenant: boolean;
}

export function DeviceHealthTable({ entries, showTenant }: DeviceHealthTableProps) {
  if (entries.length === 0) {
    return <EmptyState icon={HeartPulse} title="No devices" description="Nothing matches this filter." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Device
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={HEADER_CELL}>
              Health
            </th>
            <th scope="col" className={HEADER_CELL}>
              Updates
            </th>
            <th scope="col" className={HEADER_CELL}>
              Protection
            </th>
            <th scope="col" className={HEADER_CELL}>
              Last check-in
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map(({ device, health, assessment }) => {
            const { label, tone } = HEALTH_LEVEL_META[assessment.level];
            const patch = health.patch;
            return (
              <tr key={device.id} className="hover:bg-slate-50">
                <td className={CELL}>
                  <p className="whitespace-nowrap font-medium text-slate-900">{device.name}</p>
                  <p className="whitespace-nowrap text-xs text-slate-500">{device.model}</p>
                  <p className="whitespace-nowrap text-xs text-slate-500">{health.osVersion}</p>
                </td>
                {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(device.tenantId)}</td>}
                <td className={cn(CELL, 'min-w-48')}>
                  <Badge tone={tone}>{label}</Badge>
                  {assessment.reasons.length > 0 && (
                    <p className="mt-1 max-w-64 text-xs text-slate-500">{assessment.reasons.join(' · ')}</p>
                  )}
                </td>
                <td className={CELL}>
                  <p
                    className={cn(
                      'whitespace-nowrap',
                      patch.status === 'failed' || patch.status === 'overdue'
                        ? 'text-rose-700'
                        : patch.status === 'pending'
                          ? 'text-amber-700'
                          : 'text-slate-700',
                    )}
                  >
                    {patch.status === 'current'
                      ? patch.kind === 'firmware'
                        ? 'Firmware current'
                        : 'Up to date'
                      : patch.status === 'failed'
                        ? 'Last run failed'
                        : patch.status === 'not-applicable'
                          ? '—'
                          : `${patch.missing} ${patch.status}`}
                  </p>
                  {patch.lastPatchedOn && (
                    <p className="whitespace-nowrap text-xs text-slate-500">Last {formatDate(patch.lastPatchedOn)}</p>
                  )}
                </td>
                <td className={CELL}>
                  {health.edr === 'not-applicable' ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <div className="space-y-0.5 text-xs">
                      <p className={cn('flex items-center gap-1.5 whitespace-nowrap', health.edr === 'active' ? 'text-slate-700' : 'text-amber-700')}>
                        {health.edr === 'active' ? (
                          <ShieldCheck aria-hidden="true" className="size-3.5 text-emerald-600" />
                        ) : (
                          <ShieldAlert aria-hidden="true" className="size-3.5 text-amber-600" />
                        )}
                        {health.edrProduct}
                        {health.edr === 'outdated' && ' (outdated)'}
                      </p>
                      <p
                        className={cn(
                          'flex items-center gap-1.5 whitespace-nowrap',
                          health.encryption === 'encrypted' ? 'text-slate-700' : 'text-amber-700',
                        )}
                      >
                        {health.encryption === 'encrypted' ? (
                          <Lock aria-hidden="true" className="size-3.5 text-emerald-600" />
                        ) : (
                          <LockOpen aria-hidden="true" className="size-3.5 text-amber-600" />
                        )}
                        {health.encryption === 'encrypted' ? 'Encrypted' : 'Not encrypted'}
                      </p>
                    </div>
                  )}
                </td>
                <td className={CELL}>
                  <time dateTime={device.lastSeen} title={formatDateTime(device.lastSeen)} className="whitespace-nowrap text-slate-700">
                    {formatRelativeTime(device.lastSeen)}
                  </time>
                  {health.diskFreePercent !== null && (
                    <p
                      className={cn(
                        'whitespace-nowrap text-xs tabular-nums',
                        health.diskFreePercent < 10 ? 'text-amber-700' : 'text-slate-500',
                      )}
                    >
                      {health.diskFreePercent}% disk free
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
