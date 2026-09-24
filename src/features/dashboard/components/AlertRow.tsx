import { Badge } from '../../../components/ui/Badge';
import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Alert } from '../../../types/alert';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { ALERT_SEVERITY_META } from '../constants/alertSeverityMeta';

interface AlertRowProps {
  alert: Alert;
  showTenant: boolean;
}

export function AlertRow({ alert, showTenant }: AlertRowProps) {
  const severity = ALERT_SEVERITY_META[alert.severity];
  const Icon = severity.icon;

  return (
    <li className="flex gap-3 px-4 py-3">
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${severity.iconClassName}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-900">{alert.title}</p>
          <time
            dateTime={alert.createdAt}
            title={formatDateTime(alert.createdAt)}
            className="shrink-0 text-xs text-slate-500"
          >
            {formatRelativeTime(alert.createdAt)}
          </time>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{alert.description}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
          <Badge tone={severity.tone}>{severity.label}</Badge>
          {showTenant && <span className="truncate">{getTenantName(alert.tenantId)}</span>}
        </div>
      </div>
    </li>
  );
}
