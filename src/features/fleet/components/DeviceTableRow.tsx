import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Device } from '../../../types/device';
import { TenantAvatar } from '../../tenants/components/TenantAvatar';
import { getTenant, getTenantName } from '../../tenants/utils/tenantLookup';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { DeviceTypeCell } from './DeviceTypeCell';
import { TermCell } from './TermCell';

interface DeviceTableRowProps {
  device: Device;
  showTenant: boolean;
}

export function DeviceTableRow({ device, showTenant }: DeviceTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="px-3 py-3 first:pl-4 last:pr-4">
        <p className="whitespace-nowrap font-medium text-slate-900">{device.name}</p>
        <p className="whitespace-nowrap text-xs text-slate-500">{device.model}</p>
      </td>
      <td className="px-3 py-3 first:pl-4 last:pr-4">
        <DeviceTypeCell type={device.type} />
      </td>
      {showTenant && (
        <td className="px-3 py-3 first:pl-4 last:pr-4">
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-700">
            <TenantAvatar tenant={getTenant(device.tenantId)} size="sm" />
            {getTenantName(device.tenantId)}
          </span>
        </td>
      )}
      <td className="px-3 py-3 first:pl-4 last:pr-4">
        {device.assignedUser ? (
          <p className="whitespace-nowrap text-slate-900">{device.assignedUser}</p>
        ) : (
          <p className="whitespace-nowrap text-slate-400">Unassigned</p>
        )}
        <p className="whitespace-nowrap text-xs text-slate-500">{device.location}</p>
      </td>
      <td className="px-3 py-3 first:pl-4 last:pr-4">
        <DeviceStatusBadge status={device.status} />
        <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
          Seen{' '}
          <time dateTime={device.lastSeen} title={formatDateTime(device.lastSeen)}>
            {formatRelativeTime(device.lastSeen)}
          </time>
        </p>
      </td>
      <td className="px-3 py-3 first:pl-4 last:pr-4 font-mono text-xs">
        {device.ipAddress ? (
          <p className="text-slate-900">{device.ipAddress}</p>
        ) : (
          <p className="font-sans text-slate-400">No IP assigned</p>
        )}
        <p className="text-slate-500">{device.macAddress}</p>
      </td>
      <td className="px-3 py-3 first:pl-4 last:pr-4">
        <TermCell device={device} />
      </td>
    </tr>
  );
}
