import { createContext } from 'react';
import type { Device, DeviceStatus } from '../../../types/device';

export interface DevicesContextValue {
  /** Every managed device across all tenants. */
  devices: Device[];
  setDeviceStatus: (deviceIds: string[], status: DeviceStatus) => void;
  /** Newly delivered hardware joins the fleet. */
  addDevices: (devices: Device[]) => void;
  /** Returned hardware leaves the fleet. */
  removeDevices: (deviceIds: string[]) => void;
  /** Applies per-device field changes (e.g. a delivered device coming online). */
  updateDevices: (patches: Record<string, Partial<Device>>) => void;
  /** Wiped and kept on site as spares: active again, assigned to nobody. */
  unassignDevices: (deviceIds: string[]) => void;
}

export const DevicesContext = createContext<DevicesContextValue | null>(null);
