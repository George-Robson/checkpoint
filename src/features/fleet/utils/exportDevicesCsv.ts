import { DEVICE_CATEGORY_META } from '../../../constants/deviceCategory';
import { DEVICE_STATUS_META } from '../../../constants/deviceStatus';
import { downloadCsv, toCsv } from '../../../lib/csv';
import { getNow, toIsoDate } from '../../../lib/date';
import type { Device } from '../../../types/device';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { ACQUISITION_META } from '../../orders/constants/acquisitionMeta';

const HEADERS = [
  'Device',
  'Model',
  'Category',
  'Type',
  'Client',
  'Assigned user',
  'Location',
  'Status',
  'IP address',
  'MAC address',
  'Ownership',
  'Lease start / purchased',
  'Lease / warranty end',
  'Last seen (UTC)',
];

/** Exports exactly the rows currently shown (filters and sort applied). */
export function exportDevicesCsv(devices: Device[], scopeCode: string): void {
  const rows = devices.map((device) => [
    device.name,
    device.model,
    DEVICE_CATEGORY_META[device.category].label,
    DEVICE_TYPE_META[device.type].label,
    getTenantName(device.tenantId),
    device.assignedUser,
    device.location,
    DEVICE_STATUS_META[device.status].label,
    device.ipAddress,
    device.macAddress,
    ACQUISITION_META[device.acquisition].ownership,
    device.termStartDate,
    device.termEndDate,
    device.lastSeen,
  ]);

  downloadCsv(`checkpoint-fleet-${scopeCode.toLowerCase()}-${toIsoDate(getNow())}.csv`, toCsv(HEADERS, rows));
}
