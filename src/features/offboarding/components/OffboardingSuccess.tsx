import { CalendarClock, CircleCheck } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { formatDate } from '../../../lib/date';
import type { OffboardingRequest } from '../../../types/offboarding';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { DEVICE_ACTION_META } from '../constants/deviceActionMeta';
import { OffboardingStatusBadge } from './OffboardingStatusBadge';

interface OffboardingSuccessProps {
  request: OffboardingRequest;
  primarySite: string;
}

export function OffboardingSuccess({ request, primarySite }: OffboardingSuccessProps) {
  const startedNow = request.status === 'in-progress';
  const wipeCount = request.deviceActions.filter((deviceAction) => deviceAction.action !== 'retain').length;
  const lastDay = formatDate(request.lastWorkingDay);
  const StatusIcon = startedNow ? CircleCheck : CalendarClock;

  const nextSteps = [
    startedNow
      ? 'Sign-in is blocked and all active sessions have been revoked.'
      : `Sign-in will be blocked at 17:00 on ${lastDay}.`,
    wipeCount > 0 &&
      (startedNow
        ? `${wipeCount} ${wipeCount === 1 ? 'device is' : 'devices are'} now wiping. Progress shows in Fleet.`
        : `${wipeCount} ${wipeCount === 1 ? 'device' : 'devices'} will be wiped once access is revoked.`),
    request.returnMethod === 'courier' && `A courier collection is booked with ${request.employee} for ${lastDay}.`,
    request.returnMethod === 'drop-off' && `Returned devices are left at ${primarySite} for engineer collection.`,
    request.lineManager &&
      request.accountActions.some((action) => action === 'convert-mailbox' || action === 'transfer-files') &&
      `${request.lineManager} receives the mailbox and files.`,
  ].filter((step): step is string => Boolean(step));

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            startedNow ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600',
          )}
        >
          <StatusIcon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-base font-medium text-slate-900">
            {startedNow ? 'Offboarding started' : 'Offboarding scheduled'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {request.employee} · {getTenantName(request.tenantId)} · last working day {lastDay}
          </p>
          <div className="mt-3">
            <OffboardingStatusBadge status={request.status} />
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-medium text-slate-900">Devices</h3>
        <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {request.deviceActions.map((deviceAction) => (
            <li key={deviceAction.deviceId} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="font-medium text-slate-900">{deviceAction.deviceName}</span>
              <span className="text-slate-500">{DEVICE_ACTION_META[deviceAction.action].label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-900">What happens next</h3>
        <ol className="mt-3 space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-600">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-medium tabular-nums text-slate-500">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
