import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { devices as seedDevices } from '../../../data/mockData';
import type { Device, DeviceStatus } from '../../../types/device';
import { DevicesContext, type DevicesContextValue } from './DevicesContext';

interface DevicesProviderProps {
  children: ReactNode;
}

/** In-memory fleet: seeded from mock data so actions (offboarding wipes, deliveries) show everywhere until reload. */
export function DevicesProvider({ children }: DevicesProviderProps) {
  const [devices, setDevices] = useState<Device[]>(seedDevices);
  // Mirrors state synchronously so several updates in one event (e.g. a demo-clock jump) build on each other.
  const devicesRef = useRef(devices);

  const commit = useCallback((next: Device[]) => {
    devicesRef.current = next;
    setDevices(next);
  }, []);

  const updateMatching = useCallback(
    (deviceIds: string[], update: (device: Device) => Device) => {
      const targets = new Set(deviceIds);
      commit(devicesRef.current.map((device) => (targets.has(device.id) ? update(device) : device)));
    },
    [commit],
  );

  const setDeviceStatus = useCallback(
    (deviceIds: string[], status: DeviceStatus) => updateMatching(deviceIds, (device) => ({ ...device, status })),
    [updateMatching],
  );

  const unassignDevices = useCallback(
    (deviceIds: string[]) =>
      updateMatching(deviceIds, (device) => ({ ...device, status: 'active', assignedUser: null })),
    [updateMatching],
  );

  const updateDevices = useCallback(
    (patches: Record<string, Partial<Device>>) => {
      commit(devicesRef.current.map((device) => (patches[device.id] ? { ...device, ...patches[device.id] } : device)));
    },
    [commit],
  );

  const addDevices = useCallback(
    (added: Device[]) => {
      if (added.length) commit([...devicesRef.current, ...added]);
    },
    [commit],
  );

  const removeDevices = useCallback(
    (deviceIds: string[]) => {
      const targets = new Set(deviceIds);
      commit(devicesRef.current.filter((device) => !targets.has(device.id)));
    },
    [commit],
  );

  const value = useMemo<DevicesContextValue>(
    () => ({ devices, setDeviceStatus, updateDevices, addDevices, removeDevices, unassignDevices }),
    [devices, setDeviceStatus, updateDevices, addDevices, removeDevices, unassignDevices],
  );

  return <DevicesContext value={value}>{children}</DevicesContext>;
}
