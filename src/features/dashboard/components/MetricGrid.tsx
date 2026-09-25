import { MonitorCheck, RefreshCw, ShieldAlert, Truck } from 'lucide-react';
import { paths } from '../../../app/paths';
import { StatusDot } from '../../../components/ui/StatusDot';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import type { DashboardMetrics } from '../types/dashboardMetrics';
import { MetricCard } from './MetricCard';

interface MetricGridProps {
  metrics: DashboardMetrics;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  const { totalDevices, statusCounts, openOrders, ordersAwaitingApproval, refreshQueue, alerts, criticalAlerts } =
    metrics;
  const activeShare = totalDevices > 0 ? Math.round((statusCounts.active / totalDevices) * 100) : 0;
  const nextRefresh = refreshQueue[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Active devices"
        value={statusCounts.active}
        icon={MonitorCheck}
        to={`${paths.fleet}?status=active`}
        detail={
          totalDevices > 0 ? `${activeShare}% of ${totalDevices} managed devices` : 'No managed devices'
        }
      />
      <MetricCard
        label="Pending deployments"
        value={openOrders}
        icon={Truck}
        to={paths.storefront}
        detail={
          ordersAwaitingApproval > 0 ? `${ordersAwaitingApproval} awaiting approval` : 'No orders awaiting approval'
        }
      />
      <MetricCard
        label="Due for refresh"
        value={refreshQueue.length}
        icon={RefreshCw}
        to={`${paths.fleet}?lease=due`}
        detail={
          nextRefresh
            ? `Next: ${nextRefresh.device.name} in ${nextRefresh.daysRemaining} ${nextRefresh.daysRemaining === 1 ? 'day' : 'days'}`
            : `None ending within ${REFRESH_WINDOW_DAYS} days`
        }
      />
      <MetricCard
        label="Open alerts"
        value={alerts.length}
        icon={ShieldAlert}
        to={`${paths.fleet}?status=offline`}
        detail={
          <>
            {criticalAlerts > 0 && <StatusDot tone="rose" />}
            {criticalAlerts} critical · {statusCounts.offline} {statusCounts.offline === 1 ? 'device' : 'devices'} offline
          </>
        }
      />
    </div>
  );
}
