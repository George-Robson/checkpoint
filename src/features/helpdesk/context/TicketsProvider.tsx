import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { getNow } from '../../../lib/date';
import type { Ticket, TicketStatus, TicketUpdate } from '../../../types/ticket';
import { TICKET_STATUS_META } from '../constants/ticketMeta';
import { seedTickets } from '../utils/seedTickets';
import { TicketsContext, type RaiseTicketInput, type TicketsContextValue } from './TicketsContext';

const REFERENCE_PREFIX = 'TKT-';

function referenceNumber(ticket: Ticket): number {
  return Number(ticket.reference.slice(REFERENCE_PREFIX.length));
}

interface TicketsProviderProps {
  children: ReactNode;
}

/** In-memory tickets, standing in for the PSA: seeded history plus anything raised in the demo. */
export function TicketsProvider({ children }: TicketsProviderProps) {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  // Mirrors state synchronously so several updates in one event build on each other.
  const ticketsRef = useRef(tickets);
  const nextNumberRef = useRef(Math.max(...tickets.map(referenceNumber)) + 1);

  const commit = useCallback((next: Ticket[]) => {
    ticketsRef.current = next;
    setTickets(next);
  }, []);

  const update = useCallback(
    (ticketId: string, change: (ticket: Ticket) => Ticket) => {
      commit(ticketsRef.current.map((ticket) => (ticket.id === ticketId ? change(ticket) : ticket)));
    },
    [commit],
  );

  const raiseTicket = useCallback(
    (input: RaiseTicketInput): Ticket => {
      const number = nextNumberRef.current++;
      const ticket: Ticket = {
        ...input,
        id: `tkt-${number}`,
        reference: `${REFERENCE_PREFIX}${number}`,
        psaId: `PSA-${48300 + number - 4826}`,
        status: 'new',
        assignee: null,
        createdAt: getNow().toISOString(),
        firstResponseAt: null,
        resolvedAt: null,
        updates: [],
      };
      commit([ticket, ...ticketsRef.current]);
      return ticket;
    },
    [commit],
  );

  const addReply = useCallback(
    (ticketId: string, reply: Omit<TicketUpdate, 'id' | 'at'>) => {
      const at = getNow().toISOString();
      update(ticketId, (ticket) => {
        const fromEngineer = reply.authorRole === 'engineer';
        return {
          ...ticket,
          updates: [...ticket.updates, { ...reply, id: `u${ticket.updates.length + 1}`, at }],
          firstResponseAt: ticket.firstResponseAt ?? (fromEngineer ? at : null),
          // An engineer picking up a new ticket starts work on it; a client replying reopens a waiting one.
          status:
            fromEngineer && ticket.status === 'new'
              ? 'open'
              : !fromEngineer && ticket.status === 'waiting'
                ? 'open'
                : ticket.status,
        };
      });
    },
    [update],
  );

  const setStatus = useCallback(
    (ticketId: string, status: TicketStatus, actor: string) => {
      const at = getNow().toISOString();
      update(ticketId, (ticket) => {
        const resolving = status === 'resolved' || status === 'closed';
        return {
          ...ticket,
          status,
          resolvedAt: resolving ? (ticket.resolvedAt ?? at) : null,
          updates: [
            ...ticket.updates,
            { id: `u${ticket.updates.length + 1}`, author: actor, authorRole: 'system', at, body: `Status changed to ${TICKET_STATUS_META[status].label}.` },
          ],
        };
      });
    },
    [update],
  );

  const assign = useCallback(
    (ticketId: string, engineer: string) => update(ticketId, (ticket) => ({ ...ticket, assignee: engineer })),
    [update],
  );

  const value = useMemo<TicketsContextValue>(
    () => ({ tickets, raiseTicket, addReply, setStatus, assign }),
    [tickets, raiseTicket, addReply, setStatus, assign],
  );

  return <TicketsContext value={value}>{children}</TicketsContext>;
}
