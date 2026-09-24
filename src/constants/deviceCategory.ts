import { Laptop, Network, Phone, Server, type LucideIcon } from 'lucide-react';
import type { DeviceCategory } from '../types/device';

interface DeviceCategoryMeta {
  label: string;
  icon: LucideIcon;
}

export const DEVICE_CATEGORY_ORDER: DeviceCategory[] = ['computer', 'telephony', 'server', 'networking'];

export const DEVICE_CATEGORY_META: Record<DeviceCategory, DeviceCategoryMeta> = {
  computer: { label: 'Computers', icon: Laptop },
  telephony: { label: 'Telephony', icon: Phone },
  server: { label: 'Servers', icon: Server },
  networking: { label: 'Networking', icon: Network },
};
