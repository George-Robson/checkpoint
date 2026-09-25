import type { Device } from '../../../types/device';
import type { DeviceSort, DeviceSortKey } from '../types/deviceSort';
import { DeviceTableRow } from './DeviceTableRow';
import { SortableHeader } from './SortableHeader';

interface DeviceTableProps {
  devices: Device[];
  sort: DeviceSort;
  onSort: (key: DeviceSortKey) => void;
  showTenant: boolean;
}

export function DeviceTable({ devices, sort, onSort, showTenant }: DeviceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <SortableHeader label="Device" sortKey="name" sort={sort} onSort={onSort} />
            <SortableHeader label="Type" sortKey="type" sort={sort} onSort={onSort} />
            {showTenant && <SortableHeader label="Client" sortKey="tenant" sort={sort} onSort={onSort} />}
            <th scope="col" className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4">
              Assigned to
            </th>
            <SortableHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />
            <th scope="col" className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4">
              IP / MAC
            </th>
            <SortableHeader label="Lease / warranty ends" sortKey="leaseEnd" sort={sort} onSort={onSort} />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {devices.map((device) => (
            <DeviceTableRow key={device.id} device={device} showTenant={showTenant} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
