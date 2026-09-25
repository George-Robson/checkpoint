/** P1 = business down; P4 = low-impact request. SLA targets depend on priority and the client's plan. */
export type TicketPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type TicketStatus = 'new' | 'open' | 'waiting' | 'resolved' | 'closed';

export type TicketCategory = 'hardware' | 'software' | 'access' | 'network' | 'security' | 'request';

/** How the ticket was raised: by a person, or automatically by the monitoring tool. */
export type TicketSource = 'portal' | 'email' | 'phone' | 'monitoring';

export interface TicketUpdate {
  id: string;
  author: string;
  /** 'client' = someone at the client; 'engineer' = Checkpoint; 'system' = automated. */
  authorRole: 'client' | 'engineer' | 'system';
  body: string;
  at: string;
}

/**
 * A support ticket. In production these live in Checkpoint's PSA (professional services automation) tool
 * and are synced here; `psaId` is the PSA's own reference.
 */
export interface Ticket {
  id: string;
  reference: string;
  psaId: string;
  tenantId: string;
  subject: string;
  description: string;
  requester: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  /** Checkpoint engineer, or null while unassigned. */
  assignee: string | null;
  deviceId: string | null;
  /** The monitoring alert that raised it, if any. */
  alertId: string | null;
  createdAt: string;
  /** When Checkpoint first responded (the response SLA stops here). */
  firstResponseAt: string | null;
  /** When it was resolved (the resolution SLA stops here). */
  resolvedAt: string | null;
  updates: TicketUpdate[];
}
