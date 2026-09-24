import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import { formatDate, formatDateTime, formatRelativeDay, formatRelativeTime } from '../../../lib/date';
import type { Kit } from '../../../types/kit';
import type { Onboarding } from '../../../types/onboarding';
import { softwareMonthlyCost } from '../../licences/utils/softwareLookup';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { OnboardingStatusBadge } from './OnboardingStatusBadge';

const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface OnboardingRowProps {
  onboarding: Onboarding;
  kit: Kit | undefined;
  showTenant: boolean;
  isNew: boolean;
}

export function OnboardingRow({ onboarding, kit, showTenant, isNew }: OnboardingRowProps) {
  const upcoming = onboarding.status !== 'completed';

  return (
    <tr className={cn('transition-colors', isNew ? 'bg-indigo-50/60' : 'hover:bg-slate-50')}>
      <td className={CELL}>
        <p className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-900">
          {onboarding.person}
          {isNew && <Badge tone="indigo">New</Badge>}
        </p>
        <p className="whitespace-nowrap text-xs text-slate-500">{onboarding.jobTitle || '—'}</p>
      </td>
      {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(onboarding.tenantId)}</td>}
      <td className={CELL}>
        <p className="whitespace-nowrap text-slate-900">{formatDate(onboarding.startDate)}</p>
        <p className={cn('whitespace-nowrap text-xs', upcoming ? 'text-slate-700' : 'text-slate-500')}>
          {formatRelativeDay(onboarding.startDate)}
        </p>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>
        {kit ? kit.name : <span className="text-slate-400">No hardware</span>}
      </td>
      <td className={CELL}>
        <p className="whitespace-nowrap text-slate-700">{onboarding.softwareIds.length} licences</p>
        <p className="whitespace-nowrap text-xs text-slate-500">
          {formatCurrency(softwareMonthlyCost(onboarding.softwareIds))}/mo
        </p>
      </td>
      <td className={CELL}>
        <OnboardingStatusBadge status={onboarding.status} />
      </td>
      <td className={CELL}>
        <p className="whitespace-nowrap text-slate-700">{onboarding.reference}</p>
        <p className="whitespace-nowrap text-xs text-slate-500">
          {onboarding.requestedBy} ·{' '}
          <time dateTime={onboarding.createdAt} title={formatDateTime(onboarding.createdAt)}>
            {formatRelativeTime(onboarding.createdAt)}
          </time>
        </p>
      </td>
    </tr>
  );
}
