import type { DeviceCategory, DeviceStatus } from '../../../types/device';

export interface FleetCompositionRow {
  category: DeviceCategory;
  label: string;
  total: number;
  counts: Record<DeviceStatus, number>;
  /** The right-most non-empty status in the stack: it gets the rounded end and total label. */
  lastSegment: DeviceStatus | null;
}
