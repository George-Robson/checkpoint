import type { Device } from '../../../types/device';

export interface LeaseExpiryBucket {
  /** YYYY-MM */
  key: string;
  /** e.g. "Oct 26" */
  label: string;
  /** e.g. "October 2026" */
  longLabel: string;
  count: number;
  devices: Device[];
  /** The month overlaps the refresh window (now → now + REFRESH_WINDOW_DAYS). */
  inRefreshWindow: boolean;
}
