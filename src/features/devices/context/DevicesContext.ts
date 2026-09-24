import { createContext } from 'react';
import type { Device, DeviceStatus } from '../../../types/device';

export interface DevicesContextValue {
  /** Every managed device across all tenants. */
  devices: Device[];
  setDeviceStatus: (deviceIds: string[], status: DeviceStatus) => void;
}

export const DevicesContext = createContext<DevicesContextValue | null>(null);
