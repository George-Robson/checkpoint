import { licenceAssignments, MOCK_NOW, tenants } from '../../../data/mockData';
import { currentTickets, ENGINEERS, TICKET_TEMPLATES } from '../../../data/serviceData';
import { stableUnit } from '../../../lib/hash';
import type { Ticket, TicketCategory, TicketPriority, TicketSource } from '../../../types/ticket';
import { SLA_TARGETS } from '../constants/sla';
import { TICKET_CATEGORY_ORDER } from '../constants/ticketMeta';

/** Months of resolved history to generate before the hand-written current tickets. */
const HISTORY_MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09'];
const HISTORY_ENDS = '2026-09-20';
const FIRST_HISTORY_REFERENCE = 4400;

/** Tickets per month grow with the client's size, within sensible bounds. */
function ticketsPerMonth(seats: number): number {
  return Math.max(5, Math.min(16, Math.round(seats / 25)));
}

function pick<T>(items: readonly T[], seed: string): T {
  return items[Math.floor(stableUnit(seed) * items.length)];
}

function priorityFor(seed: string): TicketPriority {
  const roll = stableUnit(seed);
  if (roll < 0.04) return 'p1';
  if (roll < 0.22) return 'p2';
  if (roll < 0.78) return 'p3';
  return 'p4';
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

/**
 * Resolved tickets for the last few months, generated deterministically so reports have history. Most meet
 * their SLA; a few miss, as they do in real life.
 */
function historyTickets(): Omit<Ticket, 'id' | 'reference' | 'psaId'>[] {
  return tenants.flatMap((tenant) => {
    const people = [...new Set(licenceAssignments.filter((a) => a.tenantId === tenant.id).map((a) => a.person))];
    return HISTORY_MONTHS.flatMap((month) =>
      Array.from({ length: ticketsPerMonth(tenant.seats) }, (_, index) => {
        const seed = `${tenant.id}-${month}-${index}`;
        const day = 1 + Math.floor(stableUnit(`${seed}-day`) * 28);
        const hour = 8 + Math.floor(stableUnit(`${seed}-hour`) * 9);
        const createdAt = `${month}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(Math.floor(stableUnit(`${seed}-min`) * 60)).padStart(2, '0')}:00Z`;
        if (createdAt.slice(0, 10) > HISTORY_ENDS) return null;

        const category: TicketCategory = pick(TICKET_CATEGORY_ORDER, `${seed}-category`);
        const template = pick(TICKET_TEMPLATES[category], `${seed}-template`);
        const priority = priorityFor(`${seed}-priority`);
        const target = SLA_TARGETS[tenant.plan][priority];
        // Most responses land well inside the target; about 1 in 20 miss it (likewise resolutions, 1 in 12).
        const responseShare = stableUnit(`${seed}-response`) < 0.05 ? 1.3 : 0.1 + stableUnit(`${seed}-r2`) * 0.8;
        const resolutionShare = stableUnit(`${seed}-resolve`) < 0.08 ? 1.4 : 0.2 + stableUnit(`${seed}-s2`) * 0.75;
        const firstResponseAt = addMinutes(createdAt, Math.round(target.responseMinutes * responseShare));
        const resolvedAt = addMinutes(createdAt, Math.round(target.resolutionMinutes * resolutionShare));
        const assignee = pick(ENGINEERS, `${seed}-engineer`);
        const source: TicketSource = pick(['portal', 'portal', 'email', 'phone'] as const, `${seed}-source`);

        return {
          tenantId: tenant.id,
          subject: template.subject,
          description: template.subject,
          requester: people.length ? pick(people, `${seed}-requester`) : tenant.primaryContact,
          category,
          priority,
          status: resolvedAt < '2026-09-17' ? ('closed' as const) : ('resolved' as const),
          source,
          assignee,
          deviceId: null,
          alertId: null,
          createdAt,
          firstResponseAt,
          resolvedAt,
          updates: [{ id: 'u1', author: assignee, authorRole: 'engineer' as const, body: template.resolution, at: resolvedAt }],
        };
      }).filter((ticket) => ticket !== null),
    );
  });
}

/** Generated history plus the hand-written current tickets, newest first. */
export function seedTickets(): Ticket[] {
  const history = historyTickets()
    .filter((ticket) => ticket.resolvedAt !== null && ticket.resolvedAt < MOCK_NOW)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((ticket, index) => {
      const number = FIRST_HISTORY_REFERENCE + index;
      return { ...ticket, id: `tkt-${number}`, reference: `TKT-${number}`, psaId: `PSA-${46000 + index * 3}` };
    });
  return [...currentTickets, ...history].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
