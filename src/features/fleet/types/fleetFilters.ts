import type { DeviceCategory, DeviceStatus, DeviceType } from '../../../types/device';

export type FleetCategoryFilter = DeviceCategory | 'all';

/** Fleet filters, mirrored in the URL query string so views are linkable. */
export interface FleetFilters {
  category: FleetCategoryFilter;
  status: DeviceStatus | 'all';
  type: DeviceType | 'all';
  /** Only devices whose lease ends within the refresh window. */
  leaseDue: boolean;
  query: string;
}
