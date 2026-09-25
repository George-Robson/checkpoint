import type { DeviceType } from '../../../types/device';

export const VAT_RATE = 0.2;

/** Invoices are issued on the 1st and due this many days later. */
export const PAYMENT_TERMS_DAYS = 30;

/** How far back the seeded invoice history goes. */
export const INVOICE_HISTORY_MONTHS = 12;

/**
 * Monthly price for fleet devices that predate the current catalogue (older models, servers, cloud
 * instances). Catalogue models are billed at their catalogue lease price instead.
 */
export const LEGACY_MONTHLY_PRICE: Record<DeviceType, number> = {
  'windows-laptop': 42,
  macbook: 72,
  workstation: 80,
  'voip-phone': 8,
  smartphone: 30,
  'rack-server': 210,
  'virtual-instance': 145,
  switch: 45,
  firewall: 62,
  'access-point': 18,
};
