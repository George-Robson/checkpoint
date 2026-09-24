import { DEVICE_CATEGORY_META } from '../../../constants/deviceCategory';
import { DEVICE_STATUS_META } from '../../../constants/deviceStatus';
import { MOCK_NOW } from '../../../data/mockData';
import { downloadCsv, toCsv } from '../../../lib/csv';
import type { Device } from '../../../types/device';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';

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
  'Lease start',
  'Lease end',
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
    device.leaseStartDate,
    device.leaseEndDate,
    device.lastSeen,
  ]);

  downloadCsv(`checkpoint-fleet-${scopeCode.toLowerCase()}-${MOCK_NOW.slice(0, 10)}.csv`, toCsv(HEADERS, rows));
}
