import type { Tenant } from '../../../types/tenant';
import type { Ticket } from '../../../types/ticket';
import { AT_RISK_SHARE, SLA_TARGETS, type SlaTarget } from '../constants/sla';

export type SlaClockStatus = 'met' | 'breached' | 'at-risk' | 'on-track';

export interface SlaClock {
  status: SlaClockStatus;
  dueAt: string;
  /** Minutes left (negative once breached); null once the clock has stopped. */
  minutesLeft: number | null;
}

export interface TicketSla {
  target: SlaTarget;
  response: SlaClock;
  resolution: SlaClock;
}

function clock(startedAt: string, targetMinutes: number, stoppedAt: string | null, now: Date): SlaClock {
  const start = new Date(startedAt).getTime();
  const due = start + targetMinutes * 60_000;
  const dueAt = new Date(due).toISOString();

  if (stoppedAt) {
    return { status: new Date(stoppedAt).getTime() <= due ? 'met' : 'breached', dueAt, minutesLeft: null };
  }
  const minutesLeft = Math.round((due - now.getTime()) / 60_000);
  if (minutesLeft < 0) return { status: 'breached', dueAt, minutesLeft };
  const elapsedShare = (now.getTime() - start) / (targetMinutes * 60_000);
  return { status: elapsedShare >= AT_RISK_SHARE ? 'at-risk' : 'on-track', dueAt, minutesLeft };
}

/** The response and resolution clocks for a ticket, against its client's plan. */
export function ticketSla(ticket: Ticket, tenant: Tenant, now: Date): TicketSla {
  const target = SLA_TARGETS[tenant.plan][ticket.priority];
  return {
    target,
    response: clock(ticket.createdAt, target.responseMinutes, ticket.firstResponseAt, now),
    resolution: clock(ticket.createdAt, target.resolutionMinutes, ticket.resolvedAt, now),
  };
}

/** The clock that matters now: response until someone has replied, then resolution. */
export function activeClock(sla: TicketSla, ticket: Ticket): { kind: 'response' | 'resolution'; clock: SlaClock } {
  return ticket.firstResponseAt || ticket.resolvedAt
    ? { kind: 'resolution', clock: sla.resolution }
    : { kind: 'response', clock: sla.response };
}

/** e.g. 95 → "1h 35m", 2900 → "2d 0h". */
export function formatMinutes(minutes: number): string {
  const absolute = Math.abs(minutes);
  if (absolute < 60) return `${absolute}m`;
  if (absolute < 24 * 60) return `${Math.floor(absolute / 60)}h ${absolute % 60}m`;
  return `${Math.floor(absolute / (24 * 60))}d ${Math.floor((absolute % (24 * 60)) / 60)}h`;
}
