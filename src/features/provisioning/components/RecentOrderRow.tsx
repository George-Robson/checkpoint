import { Building2, UserRound } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/cn';
import { formatDate, formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Kit } from '../../../types/kit';
import type { Order } from '../../../types/order';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { OrderStatusBadge } from './OrderStatusBadge';

interface RecentOrderRowProps {
  order: Order;
  kit: Kit | undefined;
  showTenant: boolean;
  isNew: boolean;
}

const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

export function RecentOrderRow({ order, kit, showTenant, isNew }: RecentOrderRowProps) {
  const AssigneeIcon = kit?.assignmentTarget === 'site' ? Building2 : UserRound;

  return (
    <tr className={cn('transition-colors', isNew ? 'bg-indigo-50/60' : 'hover:bg-slate-50')}>
      <td className={CELL}>
        <p className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-900">
          {order.reference}
          {isNew && <Badge tone="indigo">New</Badge>}
        </p>
        <time dateTime={order.createdAt} title={formatDateTime(order.createdAt)} className="text-xs text-slate-500">
          {formatRelativeTime(order.createdAt)}
        </time>
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{kit?.name ?? order.kitId}</td>
      <td className={CELL}>
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-900">
          <AssigneeIcon aria-hidden="true" className="size-4 text-slate-400" />
          {order.assignee}
        </span>
      </td>
      {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(order.tenantId)}</td>}
      <td className={cn(CELL, 'whitespace-nowrap text-slate-500')}>{order.requestedBy}</td>
      <td className={CELL}>
        <OrderStatusBadge status={order.status} />
      </td>
      <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>
        {order.expectedDelivery ? formatDate(order.expectedDelivery) : <span className="text-slate-400">Pending</span>}
      </td>
    </tr>
  );
}
