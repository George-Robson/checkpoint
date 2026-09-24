import { createContext } from 'react';
import type { Order } from '../../../types/order';
import type { PlaceOrderInput } from '../types/placeOrderInput';

export interface OrdersContextValue {
  /** Every order across all tenants, newest first. */
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
}

export const OrdersContext = createContext<OrdersContextValue | null>(null);
