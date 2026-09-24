import { useMemo } from 'react';
import { DEVICE_CATEGORY_META, DEVICE_CATEGORY_ORDER } from '../../../constants/deviceCategory';
import { DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import type { DeviceStatus } from '../../../types/device';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import type { FleetCompositionRow } from '../types/fleetCompositionRow';

export function useFleetComposition(): FleetCompositionRow[] {
  const { devices } = useDevices();
  const scopedDevices = useTenantScoped(devices);

  return useMemo(
    () =>
      DEVICE_CATEGORY_ORDER.map((category) => {
        const inCategory = scopedDevices.filter((device) => device.category === category);
        const counts = Object.fromEntries(
          DEVICE_STATUS_ORDER.map((status) => [status, inCategory.filter((device) => device.status === status).length]),
        ) as Record<DeviceStatus, number>;

        return {
          category,
          label: DEVICE_CATEGORY_META[category].label,
          total: inCategory.length,
          counts,
          lastSegment: DEVICE_STATUS_ORDER.findLast((status) => counts[status] > 0) ?? null,
        };
      }),
    [scopedDevices],
  );
}
