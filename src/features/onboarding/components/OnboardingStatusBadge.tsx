import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import type { OnboardingStatus } from '../../../types/onboarding';
import { ONBOARDING_STATUS_META } from '../constants/onboardingStatusMeta';

interface OnboardingStatusBadgeProps {
  status: OnboardingStatus;
}

export function OnboardingStatusBadge({ status }: OnboardingStatusBadgeProps) {
  const { label, tone } = ONBOARDING_STATUS_META[status];
  return (
    <Badge tone={tone}>
      <StatusDot tone={tone} />
      {label}
    </Badge>
  );
}
