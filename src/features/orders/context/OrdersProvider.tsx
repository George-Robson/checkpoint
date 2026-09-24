import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { orders as seedOrders } from '../../../data/mockData';
import { addDays, getNow, toIsoDate } from '../../../lib/date';
import type { Order } from '../../../types/order';
import type { PlaceOrderInput } from '../types/placeOrderInput';
import { OrdersContext, type OrdersContextValue } from './OrdersContext';

const REFERENCE_PREFIX = 'CPO-';

function referenceNumber(order: Order): number {
  return Number(order.reference.slice(REFERENCE_PREFIX.length));
}

interface OrdersProviderProps {
  children: ReactNode;
}

/** In-memory order book: seeded from mock data, new orders last until reload. */
export function OrdersProvider({ children }: OrdersProviderProps) {
  const [orders, setOrders] = useState<Order[]>(() =>
    [...seedOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  const nextReferenceRef = useRef(Math.max(...seedOrders.map(referenceNumber)) + 1);

  const placeOrder = useCallback((input: PlaceOrderInput): Order => {
    const now = getNow();
    const referenceNo = nextReferenceRef.current++;

    const order: Order = {
      id: `o-${referenceNo}`,
      reference: `${REFERENCE_PREFIX}${referenceNo}`,
      kitId: input.kit.id,
      tenantId: input.tenantId,
      assignee: input.assignee,
      requestedBy: input.requestedBy,
      // Zero-touch: standard kits skip manual approval and go straight into provisioning.
      status: 'processing',
      createdAt: now.toISOString(),
      expectedDelivery: toIsoDate(addDays(now, input.kit.leadTimeDays)),
      startDate: input.startDate,
      shipTo: input.shipTo,
      notes: input.notes,
    };

    setOrders((previous) => [order, ...previous]);
    return order;
  }, []);

  const value = useMemo<OrdersContextValue>(() => ({ orders, placeOrder }), [orders, placeOrder]);

  return <OrdersContext value={value}>{children}</OrdersContext>;
}
