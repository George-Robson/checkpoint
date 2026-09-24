import { Badge } from '../../../components/ui/Badge';
import type { LeaseExpiryBucket } from '../types/leaseExpiryBucket';

interface LeaseExpiryTableProps {
  buckets: LeaseExpiryBucket[];
}

export function LeaseExpiryTable({ buckets }: LeaseExpiryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th scope="col" className="py-2 pr-4 text-left font-medium">
              Month
            </th>
            <th scope="col" className="px-4 py-2 text-left font-medium">
              Devices
            </th>
            <th scope="col" className="py-2 pl-4 text-right font-medium">
              Leases ending
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {buckets.map((bucket) => (
            <tr key={bucket.key} className="hover:bg-slate-50">
              <th scope="row" className="whitespace-nowrap py-2 pr-4 text-left font-normal text-slate-900">
                <span className="flex items-center gap-2">
                  {bucket.longLabel}
                  {bucket.inRefreshWindow && <Badge tone="indigo">Refresh window</Badge>}
                </span>
              </th>
              <td className="max-w-md truncate px-4 py-2 text-slate-500">
                {bucket.devices.map((device) => device.name).join(', ') || '—'}
              </td>
              <td className="py-2 pl-4 text-right tabular-nums text-slate-900">{bucket.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
