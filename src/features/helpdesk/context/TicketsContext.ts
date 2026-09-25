import { createContext } from 'react';
import type { Ticket, TicketCategory, TicketPriority, TicketSource, TicketStatus, TicketUpdate } from '../../../types/ticket';

export interface RaiseTicketInput {
  tenantId: string;
  subject: string;
  description: string;
  requester: string;
  category: TicketCategory;
  priority: TicketPriority;
  source: TicketSource;
  deviceId: string | null;
  alertId: string | null;
}

export interface TicketsContextValue {
  /** Newest first. */
  tickets: Ticket[];
  raiseTicket: (input: RaiseTicketInput) => Ticket;
  /** Adds a reply. An engineer's first reply stops the response SLA clock. */
  addReply: (ticketId: string, update: Omit<TicketUpdate, 'id' | 'at'>) => void;
  setStatus: (ticketId: string, status: TicketStatus, actor: string) => void;
  assign: (ticketId: string, engineer: string) => void;
}

export const TicketsContext = createContext<TicketsContextValue | null>(null);
