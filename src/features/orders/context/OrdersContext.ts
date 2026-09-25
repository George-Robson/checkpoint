import { createContext } from 'react';
import type { Order } from '../../../types/order';
import type { PlaceOrderInput } from '../types/placeOrderInput';

export interface OrderAdvanceResult {
  /** Orders that left 'pending-approval' (approved by the client). */
  approved: Order[];
  shipped: Order[];
  /** Orders that arrived; their hardware joins the fleet. */
  delivered: Order[];
}

export interface OrdersContextValue {
  /** Every order across all tenants, newest first. */
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  /**
   * Applies everything due by `today`: approvals (a day after ordering), dispatch (the day before
   * delivery) and delivery. `leadTimeFor` gives a kit's lead time for newly approved orders.
   */
  advanceTo: (today: string, leadTimeFor: (kitId: string) => number) => OrderAdvanceResult;
}

export const OrdersContext = createContext<OrdersContextValue | null>(null);
