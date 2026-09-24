import type { Tone } from '../components/ui/tone';
import type { DeviceStatus } from '../types/device';

interface DeviceStatusMeta {
  label: string;
  tone: Tone;
  /** Fill for chart marks. Validated for CVD separation in this order. */
  chartColor: string;
}

/** Canonical display order: healthy → in-flight → retiring → failing. */
export const DEVICE_STATUS_ORDER: DeviceStatus[] = ['active', 'provisioning', 'wiping', 'offline'];

export const DEVICE_STATUS_META: Record<DeviceStatus, DeviceStatusMeta> = {
  active: { label: 'Active', tone: 'emerald', chartColor: '#059669' },
  provisioning: { label: 'Provisioning', tone: 'amber', chartColor: '#f59e0b' },
  wiping: { label: 'Wiping', tone: 'slate', chartColor: '#94a3b8' },
  offline: { label: 'Offline', tone: 'rose', chartColor: '#e11d48' },
};
