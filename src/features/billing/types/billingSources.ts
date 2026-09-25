import type { Device } from '../../../types/device';
import type { Kit } from '../../../types/kit';
import type { LicencePool } from '../../../types/licence';
import type { Order } from '../../../types/order';

/** What an invoice is built from: the fleet, seat pools and orders as they stand when it's issued. */
export interface BillingSources {
  devices: Device[];
  pools: LicencePool[];
  orders: Order[];
  kits: Kit[];
}
