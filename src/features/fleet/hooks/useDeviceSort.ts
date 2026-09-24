import { useCallback, useMemo, useState } from 'react';
import type { Device } from '../../../types/device';
import type { DeviceSort, DeviceSortKey, SortDirection } from '../types/deviceSort';
import { compareDevices } from '../utils/compareDevices';

/** Direction applied the first time a column is clicked (status starts with offline first). */
const INITIAL_DIRECTION: Record<DeviceSortKey, SortDirection> = {
  name: 'asc',
  type: 'asc',
  tenant: 'asc',
  status: 'desc',
  leaseEnd: 'asc',
};

export function useDeviceSort(devices: Device[]) {
  const [sort, setSort] = useState<DeviceSort>({ key: 'name', direction: 'asc' });

  const toggleSort = useCallback((key: DeviceSortKey) => {
    setSort((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: INITIAL_DIRECTION[key] },
    );
  }, []);

  const sortedDevices = useMemo(() => {
    const multiplier = sort.direction === 'asc' ? 1 : -1;
    return [...devices].sort(
      (a, b) => compareDevices(a, b, sort.key) * multiplier || a.name.localeCompare(b.name),
    );
  }, [devices, sort]);

  return { sortedDevices, sort, toggleSort };
}
