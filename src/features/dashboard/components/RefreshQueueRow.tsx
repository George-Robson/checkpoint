import { Badge } from '../../../components/ui/Badge';
import { DEVICE_CATEGORY_META } from '../../../constants/deviceCategory';
import { formatDate } from '../../../lib/date';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import type { RefreshQueueItem } from '../types/refreshQueueItem';

/** Leases ending within this many days get the amber (warning) badge. */
const URGENT_DAYS = 30;

interface RefreshQueueRowProps {
  item: RefreshQueueItem;
  showTenant: boolean;
}

export function RefreshQueueRow({ item, showTenant }: RefreshQueueRowProps) {
  const { device, daysRemaining } = item;
  const CategoryIcon = DEVICE_CATEGORY_META[device.category].icon;
  const meta = showTenant
    ? `${getTenantName(device.tenantId)} · ${device.model}`
    : `${device.model} · ${device.assignedUser ?? device.location}`;

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
        <CategoryIcon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{device.name}</p>
        <p className="truncate text-xs text-slate-500">{meta}</p>
      </div>
      <div className="shrink-0 text-right">
        <Badge tone={daysRemaining <= URGENT_DAYS ? 'amber' : 'slate'}>{daysRemaining}d left</Badge>
        <p className="mt-0.5 text-xs text-slate-500">{formatDate(device.leaseEndDate)}</p>
      </div>
    </li>
  );
}
