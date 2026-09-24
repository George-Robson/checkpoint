import type { Device } from '../../../types/device';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';

/** Case-insensitive match across every identifier shown in the table. */
export function matchesSearch(device: Device, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;

  const haystack = [
    device.name,
    device.model,
    DEVICE_TYPE_META[device.type].label,
    getTenantName(device.tenantId),
    device.assignedUser,
    device.location,
    device.ipAddress,
    device.macAddress,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}
