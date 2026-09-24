import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { DEVICE_STATUS_META } from '../../../constants/deviceStatus';
import type { DeviceStatus } from '../../../types/device';

interface DeviceStatusBadgeProps {
  status: DeviceStatus;
}

export function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
  const { label, tone } = DEVICE_STATUS_META[status];
  return (
    <Badge tone={tone}>
      <StatusDot tone={tone} />
      {label}
    </Badge>
  );
}
