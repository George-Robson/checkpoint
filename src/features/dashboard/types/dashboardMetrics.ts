import type { Alert } from '../../../types/alert';
import type { DeviceStatus } from '../../../types/device';
import type { RefreshQueueItem } from './refreshQueueItem';

export interface DashboardMetrics {
  totalDevices: number;
  statusCounts: Record<DeviceStatus, number>;
  openOrders: number;
  ordersAwaitingApproval: number;
  /** Devices due for refresh, soonest lease end first. */
  refreshQueue: RefreshQueueItem[];
  /** Critical first, then newest first. */
  alerts: Alert[];
  criticalAlerts: number;
}
