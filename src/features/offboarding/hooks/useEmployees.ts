import { useMemo } from 'react';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import type { Employee } from '../types/employee';
import { employeeKey } from '../utils/employeeKey';

/** Everyone with at least one assigned device in the selected tenant scope, A–Z. */
export function useEmployees(): Employee[] {
  const { devices } = useDevices();
  const scopedDevices = useTenantScoped(devices);

  return useMemo(() => {
    const byKey = new Map<string, Employee>();

    for (const device of scopedDevices) {
      if (!device.assignedUser) continue;
      const key = employeeKey(device.tenantId, device.assignedUser);
      const existing = byKey.get(key);
      if (existing) {
        existing.devices.push(device);
      } else {
        byKey.set(key, {
          key,
          name: device.assignedUser,
          tenantId: device.tenantId,
          devices: [device],
          primarySite: device.location.split(' · ')[0],
        });
      }
    }

    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [scopedDevices]);
}
