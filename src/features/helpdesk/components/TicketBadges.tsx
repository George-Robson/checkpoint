import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import type { TicketPriority, TicketStatus } from '../../../types/ticket';
import { TICKET_PRIORITY_META, TICKET_STATUS_META } from '../constants/ticketMeta';

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const { short, tone, label } = TICKET_PRIORITY_META[priority];
  return (
    <Badge tone={tone}>
      <span title={label}>{short}</span>
    </Badge>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const { label, tone } = TICKET_STATUS_META[status];
  return (
    <Badge tone={tone}>
      <StatusDot tone={tone} />
      {label}
    </Badge>
  );
}
