import { Badge } from '../../../components/ui/Badge';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import { formatDate, getNow } from '../../../lib/date';
import { daysUntilTermEnd } from '../../../lib/deviceTerm';
import type { Device } from '../../../types/device';
import { ACQUISITION_META } from '../../orders/constants/acquisitionMeta';

interface TermCellProps {
  device: Device;
}

/** When the lease (leased devices) or warranty (owned devices) ends. */
export function TermCell({ device }: TermCellProps) {
  const daysRemaining = daysUntilTermEnd(device, getNow());
  const owned = device.acquisition === 'purchase';

  return (
    <div className="whitespace-nowrap">
      <span className="inline-flex items-center gap-2">
        <span className="text-slate-700">{formatDate(device.termEndDate)}</span>
        {daysRemaining < 0 && <Badge tone="slate">Ended</Badge>}
        {daysRemaining >= 0 && daysRemaining <= REFRESH_WINDOW_DAYS && <Badge tone="amber">{daysRemaining}d</Badge>}
      </span>
      <p className="text-xs text-slate-500">
        {ACQUISITION_META[device.acquisition].ownership} · {owned ? 'warranty' : 'lease'}
      </p>
    </div>
  );
}
