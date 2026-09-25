import { useState } from 'react';
import { CircleCheck, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FilterSelect, type FilterSelectOption } from '../../components/ui/FilterSelect';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { getNow } from '../../lib/date';
import type { TicketPriority } from '../../types/ticket';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { RaiseTicketDrawer } from './components/RaiseTicketDrawer';
import { SupportSummary } from './components/SupportSummary';
import { TicketDrawer } from './components/TicketDrawer';
import { TicketsTable } from './components/TicketsTable';
import { isOpenStatus, TICKET_PRIORITY_META, TICKET_PRIORITY_ORDER } from './constants/ticketMeta';
import { useTickets } from './hooks/useTickets';

type StatusFilter = 'open' | 'resolved' | 'all';

const STATUS_OPTIONS: FilterSelectOption<StatusFilter>[] = [
  { value: 'open', label: 'Open tickets' },
  { value: 'resolved', label: 'Resolved & closed' },
  { value: 'all', label: 'All tickets' },
];

const PRIORITY_OPTIONS: FilterSelectOption<TicketPriority | 'all'>[] = [
  { value: 'all', label: 'All priorities' },
  ...TICKET_PRIORITY_ORDER.map((priority) => ({ value: priority, label: TICKET_PRIORITY_META[priority].label })),
];

export function SupportPage() {
  const [searchParams] = useSearchParams();
  const { selectedTenant, isGlobalView } = useTenant();
  const { tickets } = useTickets();
  const scoped = useTenantScoped(tickets);
  const [status, setStatus] = useState<StatusFilter>('open');
  const [priority, setPriority] = useState<TicketPriority | 'all'>('all');
  const [query, setQuery] = useState('');
  // Other pages link straight to a ticket with ?ticket=<id>.
  const [openId, setOpenId] = useState<string | null>(() => searchParams.get('ticket'));
  const [raising, setRaising] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const now = getNow();
  const normalizedQuery = query.trim().toLowerCase();
  const visible = scoped.filter(
    (ticket) =>
      (status === 'all' || (status === 'open') === isOpenStatus(ticket.status)) &&
      (priority === 'all' || ticket.priority === priority) &&
      (!normalizedQuery ||
        `${ticket.reference} ${ticket.subject} ${ticket.requester} ${ticket.assignee ?? ''}`.toLowerCase().includes(normalizedQuery)),
  );
  const openTicket = openId ? tickets.find((ticket) => ticket.id === openId) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description={`Tickets${selectedTenant ? ` for ${selectedTenant.name}` : ' across clients'}, with response and resolution targets tracked against each client’s plan. Synced with Checkpoint’s PSA.`}
        actions={
          <Button onClick={() => setRaising(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Raise a ticket
          </Button>
        }
      />

      {notice && (
        <div role="status" className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          {notice}
        </div>
      )}

      <SupportSummary tickets={scoped} now={now} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search tickets, people…"
            aria-label="Search tickets"
            className="w-full sm:w-64"
          />
          <FilterSelect label="Filter by status" value={status} options={STATUS_OPTIONS} onChange={setStatus} active={status !== 'open'} />
          <FilterSelect
            label="Filter by priority"
            value={priority}
            options={PRIORITY_OPTIONS}
            onChange={setPriority}
            active={priority !== 'all'}
          />
          <p aria-live="polite" className="ml-auto text-sm tabular-nums text-slate-500">
            {visible.length} {visible.length === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
        <TicketsTable tickets={visible} now={now} showTenant={isGlobalView} onOpen={setOpenId} />
      </Card>

      {openTicket && <TicketDrawer key={openTicket.id} ticket={openTicket} now={now} onClose={() => setOpenId(null)} />}
      {raising && (
        <RaiseTicketDrawer
          onClose={() => setRaising(false)}
          onRaised={(ticket) => {
            setRaising(false);
            setNotice(`Raised ${ticket.reference}: “${ticket.subject}”. The service desk has been notified.`);
            setOpenId(ticket.id);
          }}
        />
      )}
    </div>
  );
}
