import { REFRESH_WINDOW_DAYS } from '../data/mockData';
import type { Device } from '../types/device';
import { daysBetween, parseDate } from './date';

/** Days until the device's lease (or, if owned, warranty) ends; negative once it has lapsed. */
export function daysUntilTermEnd(device: Device, now: Date): number {
  return daysBetween(now, parseDate(device.termEndDate));
}

/** True when the lease or warranty ends within the refresh window (lapsed terms are excluded). */
export function isDueForRefresh(device: Device, now: Date): boolean {
  const daysRemaining = daysUntilTermEnd(device, now);
  return daysRemaining >= 0 && daysRemaining <= REFRESH_WINDOW_DAYS;
}
