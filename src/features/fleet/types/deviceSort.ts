export type DeviceSortKey = 'name' | 'type' | 'tenant' | 'status' | 'leaseEnd';

export type SortDirection = 'asc' | 'desc';

export interface DeviceSort {
  key: DeviceSortKey;
  direction: SortDirection;
}
