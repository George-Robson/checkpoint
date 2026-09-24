import type { Kit } from '../../../types/kit';

export interface PlaceOrderInput {
  kit: Kit;
  tenantId: string;
  assignee: string;
  requestedBy: string;
  startDate: string;
  shipTo: string;
  notes?: string;
}
