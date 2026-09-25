import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { orders as seedOrders } from '../../../data/mockData';
import { addDays, getNow, parseDate, toIsoDate } from '../../../lib/date';
import type { Order } from '../../../types/order';
import type { PlaceOrderInput } from '../types/placeOrderInput';
import { OrdersContext, type OrderAdvanceResult, type OrdersContextValue } from './OrdersContext';

const REFERENCE_PREFIX = 'CPO-';

/** Clients approve orders the working day after they're raised (mock). */
const APPROVAL_DAYS = 1;

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
  // Mirrors state synchronously so several updates in one event build on each other.
  const ordersRef = useRef(orders);
  const nextReferenceRef = useRef(Math.max(...seedOrders.map(referenceNumber)) + 1);

  const commit = useCallback((next: Order[]) => {
    ordersRef.current = next;
    setOrders(next);
  }, []);

  const placeOrder = useCallback(
    (input: PlaceOrderInput): Order => {
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
        acquisition: input.acquisition,
        createdAt: now.toISOString(),
        expectedDelivery: toIsoDate(addDays(now, input.kit.leadTimeDays)),
        startDate: input.startDate,
        shipTo: input.shipTo,
        notes: input.notes,
        onboardingId: input.onboardingId,
      };

      commit([order, ...ordersRef.current]);
      return order;
    },
    [commit],
  );

  const advanceTo = useCallback(
    (today: string, leadTimeFor: (kitId: string) => number): OrderAdvanceResult => {
      const result: OrderAdvanceResult = { approved: [], shipped: [], delivered: [] };

      const next = ordersRef.current.map((original) => {
        let order = original;

        if (order.status === 'pending-approval') {
          const approvedOn = toIsoDate(addDays(parseDate(order.createdAt.slice(0, 10)), APPROVAL_DAYS));
          if (approvedOn > today) return order;
          order = {
            ...order,
            status: 'processing',
            expectedDelivery: toIsoDate(addDays(parseDate(approvedOn), leadTimeFor(order.kitId))),
          };
          result.approved.push(order);
        }

        if (!order.expectedDelivery || order.status === 'delivered') return order;
        const dispatchOn = toIsoDate(addDays(parseDate(order.expectedDelivery), -1));

        if (order.expectedDelivery <= today) {
          order = { ...order, status: 'delivered' };
          result.delivered.push(order);
        } else if (order.status === 'processing' && dispatchOn <= today) {
          order = { ...order, status: 'shipped' };
          result.shipped.push(order);
        }
        return order;
      });

      if (result.approved.length || result.shipped.length || result.delivered.length) commit(next);
      return result;
    },
    [commit],
  );

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, placeOrder, advanceTo }),
    [orders, placeOrder, advanceTo],
  );

  return <OrdersContext value={value}>{children}</OrdersContext>;
}
