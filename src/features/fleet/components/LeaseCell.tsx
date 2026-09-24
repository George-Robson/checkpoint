import { Badge } from '../../../components/ui/Badge';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import { formatDate, getNow } from '../../../lib/date';
import { daysUntilLeaseEnd } from '../../../lib/lease';
import type { Device } from '../../../types/device';

interface LeaseCellProps {
  device: Device;
}

export function LeaseCell({ device }: LeaseCellProps) {
  const daysRemaining = daysUntilLeaseEnd(device, getNow());

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="text-slate-700">{formatDate(device.leaseEndDate)}</span>
      {daysRemaining < 0 && <Badge tone="slate">Ended</Badge>}
      {daysRemaining >= 0 && daysRemaining <= REFRESH_WINDOW_DAYS && <Badge tone="amber">{daysRemaining}d</Badge>}
    </span>
  );
}
