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
  createdAt: string;
  expectedDelivery: string | null;
  /** Start date (user kits) or go-live date (site kits). */
  startDate?: string;
  shipTo?: string;
  notes?: string;
}
