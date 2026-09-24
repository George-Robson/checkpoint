import {
  BrickWall,
  Cloud,
  Laptop,
  LaptopMinimal,
  Monitor,
  Network,
  Phone,
  Server,
  Smartphone,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { DeviceCategory, DeviceType } from '../types/device';

interface DeviceTypeMeta {
  label: string;
  icon: LucideIcon;
  category: DeviceCategory;
}

/** Grouped by category (computers → telephony → servers → networking). */
export const DEVICE_TYPE_ORDER: DeviceType[] = [
  'windows-laptop',
  'macbook',
  'workstation',
  'voip-phone',
  'smartphone',
  'rack-server',
  'virtual-instance',
  'switch',
  'firewall',
  'access-point',
];

export const DEVICE_TYPE_META: Record<DeviceType, DeviceTypeMeta> = {
  'windows-laptop': { label: 'Windows Laptop', icon: Laptop, category: 'computer' },
  macbook: { label: 'MacBook', icon: LaptopMinimal, category: 'computer' },
  workstation: { label: 'Workstation', icon: Monitor, category: 'computer' },
  'voip-phone': { label: 'VoIP Desk Phone', icon: Phone, category: 'telephony' },
  smartphone: { label: 'Smartphone', icon: Smartphone, category: 'telephony' },
  'rack-server': { label: 'Rack Server', icon: Server, category: 'server' },
  'virtual-instance': { label: 'Virtual Instance', icon: Cloud, category: 'server' },
  switch: { label: 'Managed Switch', icon: Network, category: 'networking' },
  firewall: { label: 'Firewall', icon: BrickWall, category: 'networking' },
  'access-point': { label: 'Access Point', icon: Wifi, category: 'networking' },
};
