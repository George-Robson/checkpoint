import type { Acquisition } from './acquisition';

export type OrderStatus = 'pending-approval' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  reference: string;
  kitId: string;
  tenantId: string;
  /** New hire's name, or the site name for site kits. */
  assignee: string;
  requestedBy: string;
  status: OrderStatus;
  /** Leased, or bought outright by the client. */
  acquisition: Acquisition;
  createdAt: string;
  expectedDelivery: string | null;
  /** Start date (user kits) or go-live date (site kits). */
  startDate?: string;
  shipTo?: string;
  notes?: string;
  /** Set when the order was placed as part of onboarding a new hire (tracked there, not in the Storefront). */
  onboardingId?: string;
}
