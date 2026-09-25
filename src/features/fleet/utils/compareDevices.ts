import { DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import type { Device } from '../../../types/device';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import type { DeviceSortKey } from '../types/deviceSort';

/** Ascending comparison of two devices on a single column. */
export function compareDevices(a: Device, b: Device, key: DeviceSortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'type':
      return DEVICE_TYPE_META[a.type].label.localeCompare(DEVICE_TYPE_META[b.type].label);
    case 'tenant':
      return getTenantName(a.tenantId).localeCompare(getTenantName(b.tenantId));
    case 'status':
      return DEVICE_STATUS_ORDER.indexOf(a.status) - DEVICE_STATUS_ORDER.indexOf(b.status);
    case 'leaseEnd':
      return a.termEndDate.localeCompare(b.termEndDate);
  }
}
