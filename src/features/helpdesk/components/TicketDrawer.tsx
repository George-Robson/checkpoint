import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { alerts } from '../../../data/mockData';
import { ENGINEERS } from '../../../data/serviceData';
import { cn } from '../../../lib/cn';
import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Ticket, TicketStatus } from '../../../types/ticket';
import { useDevices } from '../../devices/hooks/useDevices';
import { useSession } from '../../session/hooks/useSession';
import { getTenant } from '../../tenants/utils/tenantLookup';
import { SLA_TARGETS } from '../constants/sla';
import {
  isOpenStatus,
  TICKET_CATEGORY_META,
  TICKET_PRIORITY_META,
  TICKET_SOURCE_LABEL,
  TICKET_STATUS_META,
  TICKET_STATUS_ORDER,
} from '../constants/ticketMeta';
import { useTickets } from '../hooks/useTickets';
import { formatMinutes, ticketSla } from '../utils/ticketSla';
import { SlaBadge } from './SlaBadge';
import { TicketPriorityBadge, TicketStatusBadge } from './TicketBadges';

interface TicketDrawerProps {
  ticket: Ticket;
  now: Date;
  onClose: () => void;
}

/** A ticket's details, SLA clocks and conversation. Checkpoint engineers can assign it and change its status. */
export function TicketDrawer({ ticket, now, onClose }: TicketDrawerProps) {
  const { currentUser } = useSession();
  const { devices } = useDevices();
  const { addReply, setStatus, assign } = useTickets();
  const [reply, setReply] = useState('');
  const isEngineer = currentUser.role === 'msp-admin';
  const tenant = getTenant(ticket.tenantId);
  const sla = tenant ? ticketSla(ticket, tenant, now) : null;
  const device = ticket.deviceId ? devices.find((candidate) => candidate.id === ticket.deviceId) : undefined;
  const alert = ticket.alertId ? alerts.find((candidate) => candidate.id === ticket.alertId) : undefined;
  const CategoryIcon = TICKET_CATEGORY_META[ticket.category].icon;

  function send() {
    if (!reply.trim()) return;
    addReply(ticket.id, { author: currentUser.name, authorRole: isEngineer ? 'engineer' : 'client', body: reply.trim() });
    setReply('');
  }

  const details = [
    ['Client', tenant ? `${tenant.name} · ${tenant.plan}` : ticket.tenantId],
    ['Requester', ticket.requester],
    ['Category', TICKET_CATEGORY_META[ticket.category].label],
    ['Raised via', TICKET_SOURCE_LABEL[ticket.source]],
    ['Raised', formatDateTime(ticket.createdAt)],
    ['PSA reference', ticket.psaId],
  ];

  return (
    <Drawer
      title={ticket.subject}
      description={`${ticket.reference} · ${TICKET_PRIORITY_META[ticket.priority].label}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isEngineer ? (
            <div className="flex flex-wrap gap-2">
              <div className="w-44">
                <Select aria-label="Assignee" value={ticket.assignee ?? ''} onChange={(event) => assign(ticket.id, event.target.value)}>
                  <option value="" disabled>
                    Assign to…
                  </option>
                  {ENGINEERS.map((engineer) => (
                    <option key={engineer} value={engineer}>
                      {engineer}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-44">
                <Select
                  aria-label="Status"
                  value={ticket.status}
                  onChange={(event) => setStatus(ticket.id, event.target.value as TicketStatus, currentUser.name)}
                >
                  {TICKET_STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {TICKET_STATUS_META[status].label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ) : isOpenStatus(ticket.status) ? (
            <Button variant="secondary" onClick={() => setStatus(ticket.id, 'resolved', currentUser.name)}>
              Mark as resolved
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setStatus(ticket.id, 'open', currentUser.name)}>
              Reopen
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <TicketPriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <CategoryIcon aria-hidden="true" className="size-4 text-slate-400" />
            {ticket.assignee ?? 'Unassigned'}
          </span>
        </div>

        {sla && tenant && (
          <section className="rounded-lg border border-slate-200">
            <h3 className="border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-900">
              Service level · {tenant.plan} plan
            </h3>
            <dl className="divide-y divide-slate-100 text-sm">
              {(
                [
                  ['response', 'First response', sla.response, SLA_TARGETS[tenant.plan][ticket.priority].responseMinutes, ticket.firstResponseAt],
                  ['resolution', 'Resolution', sla.resolution, SLA_TARGETS[tenant.plan][ticket.priority].resolutionMinutes, ticket.resolvedAt],
                ] as const
              ).map(([kind, label, clock, target, stoppedAt]) => (
                <div key={kind} className="flex items-center justify-between gap-4 px-3 py-2.5">
                  <div>
                    <dt className="text-slate-900">
                      {label} <span className="text-slate-500">· within {formatMinutes(target)}</span>
                    </dt>
                    <dd className="text-xs text-slate-500">
                      {stoppedAt ? `Done ${formatDateTime(stoppedAt)}` : `Due ${formatDateTime(clock.dueAt)}`}
                    </dd>
                  </div>
                  <dd>
                    <SlaBadge kind={kind} clock={clock} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-slate-900">{value}</dd>
            </div>
          ))}
          {device && (
            <div>
              <dt className="text-xs text-slate-500">Device</dt>
              <dd className="text-slate-900">
                {device.name} <span className="text-slate-500">· {device.model}</span>
              </dd>
            </div>
          )}
          {alert && (
            <div>
              <dt className="text-xs text-slate-500">Monitoring alert</dt>
              <dd className="text-slate-900">{alert.title}</dd>
            </div>
          )}
        </dl>

        <section>
          <h3 className="text-xs font-medium text-slate-500">Conversation</h3>
          <ol className="mt-2 space-y-3">
            <li className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{ticket.requester}</span> · {formatRelativeTime(ticket.createdAt, now)}
              </p>
              <p className="mt-1 text-slate-900">{ticket.description}</p>
            </li>
            {ticket.updates.map((update) => (
              <li
                key={update.id}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm',
                  update.authorRole === 'engineer' && 'border border-indigo-100 bg-indigo-50/50',
                  update.authorRole === 'client' && 'border border-slate-200',
                  update.authorRole === 'system' && 'text-xs text-slate-500',
                )}
              >
                {update.authorRole === 'system' ? (
                  <p>
                    {update.body} <span>· {update.author}, {formatRelativeTime(update.at, now)}</span>
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{update.author}</span>
                      {update.authorRole === 'engineer' && ' · Checkpoint'} · {formatRelativeTime(update.at, now)}
                    </p>
                    <p className="mt-1 text-slate-900">{update.body}</p>
                  </>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-3 space-y-2">
            <Textarea
              aria-label="Reply"
              rows={3}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={isEngineer ? 'Reply to the client…' : 'Add a reply for the service desk…'}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={send} disabled={!reply.trim()}>
                Send reply
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Drawer>
  );
}
