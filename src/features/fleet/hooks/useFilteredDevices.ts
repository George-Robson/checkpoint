import { useMemo } from 'react';
import { DEVICE_CATEGORY_ORDER } from '../../../constants/deviceCategory';
import { getNow } from '../../../lib/date';
import { isDueForRefresh } from '../../../lib/deviceTerm';
import type { Device } from '../../../types/device';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import type { FleetCategoryFilter, FleetFilters } from '../types/fleetFilters';
import { matchesSearch } from '../utils/matchesSearch';

interface FilteredDevices {
  devices: Device[];
  /** Counts per category tab, with every other filter applied. */
  categoryCounts: Record<FleetCategoryFilter, number>;
  /** All devices for the selected tenant, before filtering. */
  totalInScope: number;
}

export function useFilteredDevices(filters: FleetFilters): FilteredDevices {
  const { devices } = useDevices();
  const scopedDevices = useTenantScoped(devices);

  return useMemo(() => {
    const now = getNow();
    const normalizedQuery = filters.query.trim().toLowerCase();

    const matchingOtherFilters = scopedDevices.filter(
      (device) =>
        (filters.status === 'all' || device.status === filters.status) &&
        (filters.type === 'all' || device.type === filters.type) &&
        (filters.acquisition === 'all' || device.acquisition === filters.acquisition) &&
        (!filters.leaseDue || isDueForRefresh(device, now)) &&
        matchesSearch(device, normalizedQuery),
    );

    const categoryCounts = { all: matchingOtherFilters.length } as Record<FleetCategoryFilter, number>;
    for (const category of DEVICE_CATEGORY_ORDER) {
      categoryCounts[category] = matchingOtherFilters.filter((device) => device.category === category).length;
    }

    return {
      devices:
        filters.category === 'all'
          ? matchingOtherFilters
          : matchingOtherFilters.filter((device) => device.category === filters.category),
      categoryCounts,
      totalInScope: scopedDevices.length,
    };
  }, [scopedDevices, filters]);
}
