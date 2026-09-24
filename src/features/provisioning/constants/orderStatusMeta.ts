import type { Tone } from '../../../components/ui/tone';
import type { OrderStatus } from '../../../types/order';

interface OrderStatusMeta {
  label: string;
  tone: Tone;
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  'pending-approval': { label: 'Awaiting approval', tone: 'amber' },
  processing: { label: 'Provisioning', tone: 'indigo' },
  shipped: { label: 'Shipped', tone: 'indigo' },
  delivered: { label: 'Delivered', tone: 'emerald' },
};
