import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/cn';
import { formatDate, formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { OffboardingRequest } from '../../../types/offboarding';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { OffboardingStatusBadge } from './OffboardingStatusBadge';

const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface OffboardingRequestRowProps {
  request: OffboardingRequest;
  showTenant: boolean;
  isNew: boolean;
}

export function OffboardingRequestRow({ request, showTenant, isNew }: OffboardingRequestRowProps) {
  const wiped = request.deviceActions.filter((deviceAction) => deviceAction.action !== 'retain').length;

  return (
    <tr className={cn('transition-colors', isNew ? 'bg-indigo-50/60' : 'hover:bg-slate-50')}>
      <td className={CELL}>
        <p className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-900">
          {request.reference}
          {isNew && <Badge tone="indigo">New</Badge>}
        </p>
        <time dateTime={request.createdAt} title={formatDateTime(request.createdAt)} className="text-xs text-slate-500">
          {formatRelativeTime(request.createdAt)}
        </time>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-slate-900')}>{request.employee}</td>
      {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(request.tenantId)}</td>}
      <td className={CELL}>
        <p className="whitespace-nowrap text-slate-700">{formatDate(request.lastWorkingDay)}</p>
        {request.accessRevocation === 'immediately' && <p className="text-xs text-rose-600">Access revoked immediately</p>}
      </td>
      <td className={CELL}>
        <p className="whitespace-nowrap text-slate-700">
          {request.deviceActions.length} {request.deviceActions.length === 1 ? 'device' : 'devices'}
        </p>
        <p className="whitespace-nowrap text-xs text-slate-500">{wiped} to wipe</p>
      </td>
      <td className={CELL}>
        <OffboardingStatusBadge status={request.status} />
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-slate-500')}>{request.requestedBy}</td>
    </tr>
  );
}
