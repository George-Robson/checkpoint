import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { devices as seedDevices } from '../../../data/mockData';
import type { Device, DeviceStatus } from '../../../types/device';
import { DevicesContext, type DevicesContextValue } from './DevicesContext';

interface DevicesProviderProps {
  children: ReactNode;
}

/** In-memory fleet: seeded from mock data so actions (e.g. offboarding wipes) show everywhere until reload. */
export function DevicesProvider({ children }: DevicesProviderProps) {
  const [devices, setDevices] = useState<Device[]>(seedDevices);

  const setDeviceStatus = useCallback((deviceIds: string[], status: DeviceStatus) => {
    const targets = new Set(deviceIds);
    setDevices((previous) => previous.map((device) => (targets.has(device.id) ? { ...device, status } : device)));
  }, []);

  const value = useMemo<DevicesContextValue>(() => ({ devices, setDeviceStatus }), [devices, setDeviceStatus]);

  return <DevicesContext value={value}>{children}</DevicesContext>;
}
