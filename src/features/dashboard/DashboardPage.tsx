import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../app/paths';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatDateTime, getNow } from '../../lib/date';
import { useTenant } from '../tenants/hooks/useTenant';
import { FleetCompositionPanel } from './components/FleetCompositionPanel';
import { LeaseExpiryPanel } from './components/LeaseExpiryPanel';
import { MetricGrid } from './components/MetricGrid';
import { RecentAlertsPanel } from './components/RecentAlertsPanel';
import { RefreshQueuePanel } from './components/RefreshQueuePanel';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';

export function DashboardPage() {
  const { selectedTenant, isGlobalView } = useTenant();
  const metrics = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`${selectedTenant?.name ?? 'All clients'} · Snapshot ${formatDateTime(getNow().toISOString())}`}
        actions={
          <Link to={paths.storefront} className={buttonClasses('primary', 'md')}>
            <Plus aria-hidden="true" className="size-4" />
            Order kit
          </Link>
        }
      />

      <MetricGrid metrics={metrics} />

      {/* On desktop the list panels take the chart's row height (contain-size) and scroll internally. */}
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <FleetCompositionPanel className="lg:col-span-2" />
        <RecentAlertsPanel
          alerts={metrics.alerts}
          criticalCount={metrics.criticalAlerts}
          showTenant={isGlobalView}
          className="lg:contain-size"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <LeaseExpiryPanel className="lg:col-span-2" />
        <RefreshQueuePanel items={metrics.refreshQueue} showTenant={isGlobalView} className="lg:contain-size" />
      </div>
    </div>
  );
}
