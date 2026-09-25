import { LifeBuoy } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Ticket } from '../../../types/ticket';
import { getTenant, getTenantName } from '../../tenants/utils/tenantLookup';
import { TICKET_CATEGORY_META } from '../constants/ticketMeta';
import { activeClock, ticketSla } from '../utils/ticketSla';
import { SlaBadge } from './SlaBadge';
import { TicketPriorityBadge, TicketStatusBadge } from './TicketBadges';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface TicketsTableProps {
  tickets: Ticket[];
  now: Date;
  showTenant: boolean;
  onOpen: (ticketId: string) => void;
}

export function TicketsTable({ tickets, now, showTenant, onOpen }: TicketsTableProps) {
  if (tickets.length === 0) {
    return <EmptyState icon={LifeBuoy} title="No tickets" description="Nothing matches these filters." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Ticket
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={HEADER_CELL}>
              Priority
            </th>
            <th scope="col" className={HEADER_CELL}>
              Status
            </th>
            <th scope="col" className={HEADER_CELL}>
              SLA
            </th>
            <th scope="col" className={HEADER_CELL}>
              Assignee
            </th>
            <th scope="col" className={HEADER_CELL}>
              Raised
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => {
            const tenant = getTenant(ticket.tenantId);
            const sla = tenant ? ticketSla(ticket, tenant, now) : null;
            const current = sla ? activeClock(sla, ticket) : null;
            const CategoryIcon = TICKET_CATEGORY_META[ticket.category].icon;
            return (
              <tr key={ticket.id} className="hover:bg-slate-50">
                <td className={CELL}>
                  <button
                    type="button"
                    onClick={() => onOpen(ticket.id)}
                    className="block max-w-md truncate text-left font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {ticket.subject}
                  </button>
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
                    <CategoryIcon aria-hidden="true" className="size-3.5 text-slate-400" />
                    {ticket.reference} · {ticket.requester}
                  </p>
                </td>
                {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(ticket.tenantId)}</td>}
                <td className={CELL}>
                  <TicketPriorityBadge priority={ticket.priority} />
                </td>
                <td className={CELL}>
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className={CELL}>
                  {current && <SlaBadge kind={current.kind} clock={current.clock} />}
                </td>
                <td className={cn(CELL, 'whitespace-nowrap', ticket.assignee ? 'text-slate-700' : 'text-slate-400')}>
                  {ticket.assignee ?? 'Unassigned'}
                </td>
                <td className={CELL}>
                  <time dateTime={ticket.createdAt} title={formatDateTime(ticket.createdAt)} className="whitespace-nowrap text-slate-700">
                    {formatRelativeTime(ticket.createdAt, now)}
                  </time>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
