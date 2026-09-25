import { Card } from '../../../components/ui/Card';
import { getTenant } from '../../tenants/utils/tenantLookup';
import type { Ticket } from '../../../types/ticket';
import { isOpenStatus } from '../constants/ticketMeta';
import { formatMinutes, ticketSla } from '../utils/ticketSla';

/** SLA performance is reported over this window. */
const WINDOW_DAYS = 30;

interface SupportSummaryProps {
  tickets: Ticket[];
  now: Date;
}

/** Headline service desk figures for the current scope. */
export function SupportSummary({ tickets, now }: SupportSummaryProps) {
  const open = tickets.filter((ticket) => isOpenStatus(ticket.status));
  const openSla = open.flatMap((ticket) => {
    const tenant = getTenant(ticket.tenantId);
    return tenant ? [ticketSla(ticket, tenant, now)] : [];
  });
  const breached = openSla.filter((sla) => sla.response.status === 'breached' || sla.resolution.status === 'breached').length;
  const atRisk = openSla.filter((sla) => sla.response.status === 'at-risk' || sla.resolution.status === 'at-risk').length;

  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60_000).toISOString();
  const resolvedRecently = tickets.filter((ticket) => ticket.resolvedAt && ticket.resolvedAt >= windowStart);
  const recentSla = resolvedRecently.flatMap((ticket) => {
    const tenant = getTenant(ticket.tenantId);
    return tenant ? [ticketSla(ticket, tenant, now)] : [];
  });
  const met = recentSla.filter((sla) => sla.response.status === 'met' && sla.resolution.status === 'met').length;
  const responses = tickets
    .filter((ticket) => ticket.firstResponseAt && ticket.createdAt >= windowStart)
    .map((ticket) => (new Date(ticket.firstResponseAt ?? '').getTime() - new Date(ticket.createdAt).getTime()) / 60_000);
  const averageResponse = responses.length ? Math.round(responses.reduce((sum, minutes) => sum + minutes, 0) / responses.length) : null;

  const stats = [
    {
      label: 'Open tickets',
      value: `${open.length}`,
      detail: `${open.filter((ticket) => !ticket.assignee).length} unassigned · ${open.filter((ticket) => ticket.status === 'waiting').length} waiting on client`,
    },
    {
      label: 'SLA attention',
      value: `${breached + atRisk}`,
      detail: breached ? `${breached} breached · ${atRisk} at risk` : atRisk ? `${atRisk} at risk` : 'All open tickets on track',
      tone: breached ? 'danger' : atRisk ? 'warn' : undefined,
    },
    {
      label: `SLA met (last ${WINDOW_DAYS} days)`,
      value: recentSla.length ? `${Math.round((met / recentSla.length) * 100)}%` : '—',
      detail: `${resolvedRecently.length} tickets resolved`,
    },
    {
      label: 'Average first response',
      value: averageResponse === null ? '—' : formatMinutes(averageResponse),
      detail: `Tickets raised in the last ${WINDOW_DAYS} days`,
    },
  ];

  return (
    <Card>
      <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4">
            <dt className="text-sm text-slate-500">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-900">{stat.value}</dd>
            <dd
              className={
                stat.tone === 'danger'
                  ? 'mt-0.5 text-xs text-rose-700'
                  : stat.tone === 'warn'
                    ? 'mt-0.5 text-xs text-amber-700'
                    : 'mt-0.5 text-xs text-slate-500'
              }
            >
              {stat.detail}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
