import { useMemo } from 'react';
import { DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import { alerts } from '../../../data/mockData';
import { getNow } from '../../../lib/date';
import { daysUntilLeaseEnd, isDueForRefresh } from '../../../lib/lease';
import type { DeviceStatus } from '../../../types/device';
import { useOrders } from '../../orders/hooks/useOrders';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import { ALERT_SEVERITY_META } from '../constants/alertSeverityMeta';
import type { DashboardMetrics } from '../types/dashboardMetrics';

export function useDashboardMetrics(): DashboardMetrics {
  const { devices } = useDevices();
  const scopedDevices = useTenantScoped(devices);
  const { orders } = useOrders();
  const scopedOrders = useTenantScoped(orders);
  const scopedAlerts = useTenantScoped(alerts);

  return useMemo(() => {
    const now = getNow();

    const statusCounts = Object.fromEntries(DEVICE_STATUS_ORDER.map((status) => [status, 0])) as Record<
      DeviceStatus,
      number
    >;
    for (const device of scopedDevices) {
      statusCounts[device.status] += 1;
    }

    const refreshQueue = scopedDevices
      .filter((device) => isDueForRefresh(device, now))
      .map((device) => ({ device, daysRemaining: daysUntilLeaseEnd(device, now) }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const openOrders = scopedOrders.filter((order) => order.status !== 'delivered');

    const sortedAlerts = [...scopedAlerts].sort(
      (a, b) =>
        ALERT_SEVERITY_META[a.severity].rank - ALERT_SEVERITY_META[b.severity].rank ||
        b.createdAt.localeCompare(a.createdAt),
    );

    return {
      totalDevices: scopedDevices.length,
      statusCounts,
      openOrders: openOrders.length,
      ordersAwaitingApproval: openOrders.filter((order) => order.status === 'pending-approval').length,
      refreshQueue,
      alerts: sortedAlerts,
      criticalAlerts: scopedAlerts.filter((alert) => alert.severity === 'critical').length,
    };
  }, [scopedDevices, scopedOrders, scopedAlerts]);
}
