import { KeyRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Meter } from '../../../components/ui/Meter';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import type { PoolRow } from '../types/poolRow';
import { SoftwareLogo } from './SoftwareLogo';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface PoolsTableProps {
  rows: PoolRow[];
  showTenant: boolean;
  onManage: (poolId: string) => void;
}

export function PoolsTable({ rows, showTenant, onManage }: PoolsTableProps) {
  if (rows.length === 0) {
    return <EmptyState icon={KeyRound} title="No licences yet" description="Seat pools appear once software is assigned." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Software
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={cn(HEADER_CELL, 'w-48')}>
              Seats
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Monthly cost
            </th>
            <th scope="col" className={HEADER_CELL}>
              Renews
            </th>
            <th scope="col" className={HEADER_CELL}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            return (
              <tr key={row.pool.id} className="hover:bg-slate-50">
                <td className={CELL}>
                  <div className="flex items-center gap-3">
                    <SoftwareLogo product={row.product} size="md" />
                    <div className="min-w-0">
                      <p className="whitespace-nowrap font-medium text-slate-900">{row.product.name}</p>
                      <p className="whitespace-nowrap text-xs text-slate-500">
                        {row.product.vendor} · {formatCurrency(row.product.monthlyPricePerSeat)}/seat
                      </p>
                    </div>
                  </div>
                </td>
                {showTenant && (
                  <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(row.pool.tenantId)}</td>
                )}
                <td className={CELL}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="tabular-nums text-slate-900">
                      {row.used} / {row.pool.seats} used
                    </span>
                    <span className={row.free === 0 ? 'text-slate-500' : 'text-amber-700'}>
                      {row.free === 0 ? 'Full' : `${row.free} idle`}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Meter value={row.used} max={row.pool.seats} label={`${row.product.name} seats in use`} />
                  </div>
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-right')}>
                  <p className="tabular-nums text-slate-900">{formatCurrency(row.monthlyCost)}</p>
                  {row.unusedCost > 0 && (
                    <p className="text-xs tabular-nums text-amber-700">{formatCurrency(row.unusedCost)} idle</p>
                  )}
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{formatDate(row.pool.renewalDate)}</td>
                <td className={cn(CELL, 'text-right')}>
                  <Button variant="secondary" size="sm" onClick={() => onManage(row.pool.id)}>
                    Manage
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
