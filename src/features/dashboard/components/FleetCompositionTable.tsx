import { DEVICE_STATUS_META, DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import type { FleetCompositionRow } from '../types/fleetCompositionRow';

interface FleetCompositionTableProps {
  rows: FleetCompositionRow[];
}

export function FleetCompositionTable({ rows }: FleetCompositionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th scope="col" className="py-2 pr-4 text-left font-medium">
              Category
            </th>
            {DEVICE_STATUS_ORDER.map((status) => (
              <th key={status} scope="col" className="px-4 py-2 text-right font-medium">
                {DEVICE_STATUS_META[status].label}
              </th>
            ))}
            <th scope="col" className="py-2 pl-4 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.category} className="hover:bg-slate-50">
              <th scope="row" className="py-2 pr-4 text-left font-normal text-slate-900">
                {row.label}
              </th>
              {DEVICE_STATUS_ORDER.map((status) => (
                <td key={status} className="px-4 py-2 text-right tabular-nums text-slate-700">
                  {row.counts[status]}
                </td>
              ))}
              <td className="py-2 pl-4 text-right font-medium tabular-nums text-slate-900">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
