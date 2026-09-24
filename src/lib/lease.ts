import { REFRESH_WINDOW_DAYS } from '../data/mockData';
import type { Device } from '../types/device';
import { daysBetween, parseDate } from './date';

/** Days until the device's lease ends; negative once it has lapsed. */
export function daysUntilLeaseEnd(device: Device, now: Date): number {
  return daysBetween(now, parseDate(device.leaseEndDate));
}

/** True when the lease ends within the refresh window (lapsed leases are excluded). */
export function isDueForRefresh(device: Device, now: Date): boolean {
  const daysRemaining = daysUntilLeaseEnd(device, now);
  return daysRemaining >= 0 && daysRemaining <= REFRESH_WINDOW_DAYS;
}
