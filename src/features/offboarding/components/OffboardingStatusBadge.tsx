import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import type { OffboardingStatus } from '../../../types/offboarding';
import { OFFBOARDING_STATUS_META } from '../constants/offboardingStatusMeta';

interface OffboardingStatusBadgeProps {
  status: OffboardingStatus;
}

export function OffboardingStatusBadge({ status }: OffboardingStatusBadgeProps) {
  const { label, tone } = OFFBOARDING_STATUS_META[status];
  return (
    <Badge tone={tone}>
      <StatusDot tone={tone} />
      {label}
    </Badge>
  );
}
