import { useMemo } from 'react';
import { getNow } from '../../../lib/date';
import type { Device } from '../../../types/device';
import type { DeviceHealth } from '../../../types/deviceHealth';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import { assessHealth, getDeviceHealth, type HealthAssessment } from '../utils/deviceHealth';

export interface DeviceHealthEntry {
  device: Device;
  health: DeviceHealth;
  assessment: HealthAssessment;
}

const LEVEL_RANK = { critical: 0, warning: 1, healthy: 2, unmonitored: 3 };

/** Health for every device in scope, worst first. */
export function useFleetHealth(): DeviceHealthEntry[] {
  const { devices } = useDevices();
  const scoped = useTenantScoped(devices);

  return useMemo(() => {
    const now = getNow();
    return scoped
      .map((device) => {
        const health = getDeviceHealth(device);
        return { device, health, assessment: assessHealth(device, health, now) };
      })
      .sort(
        (a, b) => LEVEL_RANK[a.assessment.level] - LEVEL_RANK[b.assessment.level] || a.device.name.localeCompare(b.device.name),
      );
  }, [scoped]);
}
