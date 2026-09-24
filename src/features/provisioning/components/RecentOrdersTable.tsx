import { PackageOpen } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { Order } from '../../../types/order';
import { useKits } from '../../kits/hooks/useKits';
import { RecentOrderRow } from './RecentOrderRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';

interface RecentOrdersTableProps {
  orders: Order[];
  showTenant: boolean;
  highlightOrderId: string | null;
}

export function RecentOrdersTable({ orders, showTenant, highlightOrderId }: RecentOrdersTableProps) {
  const { kits } = useKits();
  const kitById = new Map(kits.map((kit) => [kit.id, kit]));
  const inProgress = orders.filter((order) => order.status !== 'delivered').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Recent orders" description={`${inProgress} in progress · ${orders.length} total`} />
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
    </Card>
  );
}
