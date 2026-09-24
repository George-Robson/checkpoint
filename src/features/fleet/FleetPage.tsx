import { useMemo } from 'react';
import { Download, Plus, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../app/paths';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { DEVICE_CATEGORY_META } from '../../constants/deviceCategory';
import { useTenant } from '../tenants/hooks/useTenant';
import { CategoryTabs } from './components/CategoryTabs';
import { DeviceTable } from './components/DeviceTable';
import { FleetToolbar } from './components/FleetToolbar';
import { DEVICE_TYPE_META, DEVICE_TYPE_ORDER } from '../../constants/deviceType';
import { useDeviceSort } from './hooks/useDeviceSort';
import { useFilteredDevices } from './hooks/useFilteredDevices';
import { useFleetFilters } from './hooks/useFleetFilters';
import { exportDevicesCsv } from './utils/exportDevicesCsv';

const TABLE_ID = 'fleet-device-table';

export function FleetPage() {
  const { selectedTenant, isGlobalView } = useTenant();
  const { filters, setCategory, setStatus, setType, setLeaseDue, setQuery, clearFilters, hasActiveFilters } =
    useFleetFilters();
  const { devices, categoryCounts, totalInScope } = useFilteredDevices(filters);
  const { sortedDevices, sort, toggleSort } = useDeviceSort(devices);

  const availableTypes = useMemo(
    () =>
      filters.category === 'all'
        ? DEVICE_TYPE_ORDER
        : DEVICE_TYPE_ORDER.filter((type) => DEVICE_TYPE_META[type].category === filters.category),
    [filters.category],
  );

  const scopeLabel = selectedTenant?.name ?? 'All clients';
  const emptyCategoryLabel = filters.category === 'all' ? 'devices' : DEVICE_CATEGORY_META[filters.category].label.toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet"
        description={`${totalInScope} managed devices · ${scopeLabel}`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => exportDevicesCsv(sortedDevices, selectedTenant?.shortCode ?? 'all')}
              disabled={sortedDevices.length === 0}
            >
              <Download aria-hidden="true" className="size-4" />
              Export CSV
            </Button>
            <Link to={paths.storefront} className={buttonClasses('primary', 'md')}>
              <Plus aria-hidden="true" className="size-4" />
              Order kit
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <CategoryTabs value={filters.category} counts={categoryCounts} onChange={setCategory} controls={TABLE_ID} />
        <FleetToolbar
          filters={filters}
          availableTypes={availableTypes}
          resultCount={sortedDevices.length}
          hasActiveFilters={hasActiveFilters}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onTypeChange={setType}
          onLeaseDueChange={setLeaseDue}
          onClearFilters={clearFilters}
        />
      </div>

      <Card id={TABLE_ID} role="tabpanel" className="overflow-hidden">
        {sortedDevices.length > 0 ? (
          <DeviceTable devices={sortedDevices} sort={sort} onSort={toggleSort} showTenant={isGlobalView} />
        ) : hasActiveFilters ? (
          <EmptyState
            icon={SearchX}
            title="No devices match these filters"
            description="Try a different search term or remove a filter."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title={`No ${emptyCategoryLabel} yet`}
            description={`${scopeLabel} has no ${emptyCategoryLabel} under management.`}
          />
        )}
      </Card>
    </div>
  );
}
