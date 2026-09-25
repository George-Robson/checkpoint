import { BellOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { buttonClasses } from '../../../components/ui/buttonStyles';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Alert } from '../../../types/alert';
import type { Ticket } from '../../../types/ticket';
import { ALERT_SEVERITY_META } from '../../dashboard/constants/alertSeverityMeta';
import { getTenantName } from '../../tenants/utils/tenantLookup';

interface MonitoringAlertsListProps {
  alerts: Alert[];
  tickets: Ticket[];
  showTenant: boolean;
  onRaiseTicket: (alert: Alert) => void;
}

/** Alerts from the monitoring tool, each linked to the ticket that's handling it (or a button to raise one). */
export function MonitoringAlertsList({ alerts, tickets, showTenant, onRaiseTicket }: MonitoringAlertsListProps) {
  if (alerts.length === 0) {
    return <EmptyState icon={BellOff} title="No open alerts" description="Everything monitored is reporting normally." />;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {alerts.map((alert) => {
        const severity = ALERT_SEVERITY_META[alert.severity];
        const Icon = severity.icon;
        const ticket = tickets.find((candidate) => candidate.alertId === alert.id);
        return (
          <li key={alert.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start">
            <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${severity.iconClassName}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{alert.title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{alert.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge tone={severity.tone}>{severity.label}</Badge>
                {showTenant && <span>{getTenantName(alert.tenantId)}</span>}
                <time dateTime={alert.createdAt} title={formatDateTime(alert.createdAt)}>
                  {formatRelativeTime(alert.createdAt)}
                </time>
              </div>
            </div>
            <div className="shrink-0 sm:pl-4">
              {ticket ? (
                <Link to={`${paths.support}?ticket=${ticket.id}`} className={buttonClasses('secondary', 'sm')}>
                  View {ticket.reference}
                </Link>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => onRaiseTicket(alert)}>
                  Raise ticket
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
