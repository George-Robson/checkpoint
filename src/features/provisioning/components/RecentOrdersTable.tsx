import { ArrowRight, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { Order } from '../../../types/order';
import { useKits } from '../../kits/hooks/useKits';
import { RecentOrderRow } from './RecentOrderRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';

interface RecentOrdersTableProps {
  orders: Order[];
  /** Orders raised by onboarding, tracked on the Onboarding page instead. */
  onboardingOrderCount: number;
  showTenant: boolean;
  highlightOrderId: string | null;
}

export function RecentOrdersTable({ orders, onboardingOrderCount, showTenant, highlightOrderId }: RecentOrdersTableProps) {
  const { kits } = useKits();
  const kitById = new Map(kits.map((kit) => [kit.id, kit]));
  const inProgress = orders.filter((order) => order.status !== 'delivered').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Recent orders" description={`Hardware orders · ${inProgress} in progress · ${orders.length} total`} />
      {orders.length === 0 ? (
        <EmptyState icon={PackageOpen} title="No orders yet" description="Orders placed from the storefront appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className={HEADER_CELL}>
                  Order
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Kit
                </th>
                <th scope="col" className={HEADER_CELL}>
                  For
                </th>
                {showTenant && (
                  <th scope="col" className={HEADER_CELL}>
                    Client
                  </th>
                )}
                <th scope="col" className={HEADER_CELL}>
                  Requested by
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Status
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Delivery
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <RecentOrderRow
                  key={order.id}
                  order={order}
                  kit={kitById.get(order.kitId)}
                  showTenant={showTenant}
                  isNew={order.id === highlightOrderId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {onboardingOrderCount > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          {onboardingOrderCount} more {onboardingOrderCount === 1 ? 'order is' : 'orders are'} part of new-hire onboarding.{' '}
          <Link to={paths.onboarding} className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700">
            View in Onboarding
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      )}
    </Card>
  );
}
