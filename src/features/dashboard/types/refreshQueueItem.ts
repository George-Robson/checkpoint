import type { Device } from '../../../types/device';

export interface RefreshQueueItem {
  device: Device;
  daysRemaining: number;
}
