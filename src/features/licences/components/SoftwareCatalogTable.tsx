import { softwareProducts } from '../../../data/mockData';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import { SOFTWARE_CATEGORY_META } from '../constants/softwareCategoryMeta';
import type { PoolRow } from '../types/poolRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface SoftwareCatalogTableProps {
  /** Pools in scope, for the usage columns. */
  rows: PoolRow[];
}

export function SoftwareCatalogTable({ rows }: SoftwareCatalogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Software
            </th>
            <th scope="col" className={HEADER_CELL}>
              Category
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Clients
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Seats in use
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Price per seat
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {softwareProducts.map((product) => {
            const pools = rows.filter((row) => row.product.id === product.id);
            const used = pools.reduce((sum, row) => sum + row.used, 0);
            const seats = pools.reduce((sum, row) => sum + row.pool.seats, 0);
            const { label, icon: CategoryIcon } = SOFTWARE_CATEGORY_META[product.category];
            return (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className={CELL}>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.vendor} · {product.detail}
                  </p>
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>
                  <span className="inline-flex items-center gap-2">
                    <CategoryIcon aria-hidden="true" className="size-4 text-slate-400" />
                    {label}
                  </span>
                </td>
                <td className={cn(CELL, 'text-right tabular-nums text-slate-700')}>{pools.length || '—'}</td>
                <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-700')}>
                  {seats ? `${used} / ${seats}` : '—'}
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-900')}>
                  {formatCurrency(product.monthlyPricePerSeat)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
