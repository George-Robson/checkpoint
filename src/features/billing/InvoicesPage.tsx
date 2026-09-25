import { useState } from 'react';
import { CircleAlert, CircleCheck, Landmark, ReceiptText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { FilterSelect, type FilterSelectOption } from '../../components/ui/FilterSelect';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { tenants } from '../../data/mockData';
import { formatDate, getNow, toIsoDate } from '../../lib/date';
import { useSession } from '../session/hooks/useSession';
import { canRecordPayments } from '../session/utils/permissions';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { CreditControlTable } from './components/CreditControlTable';
import { CreditPolicyCard } from './components/CreditPolicyCard';
import { InvoiceDrawer } from './components/InvoiceDrawer';
import { InvoicesTable } from './components/InvoicesTable';
import { InvoiceSummary } from './components/InvoiceSummary';
import { useInvoicePdf } from './hooks/useInvoicePdf';
import { useInvoices } from './hooks/useInvoices';
import { accountStanding } from './utils/accountStanding';
import { invoiceStatus } from './utils/invoiceStatus';

type StatusFilter = 'all' | 'unpaid' | 'overdue' | 'paid';
type InvoicesTab = 'invoices' | 'credit-control';
const TAB_PANEL_ID = 'invoices-tab-panel';

const STATUS_OPTIONS: FilterSelectOption<StatusFilter>[] = [
  { value: 'all', label: 'All invoices' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
];

export function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useSession();
  const { selectedTenant, isGlobalView } = useTenant();
  const { invoices, credit, recordPayment, waiveLateCharges, releaseHold, suspend, liftSuspension } = useInvoices();
  const scoped = useTenantScoped(invoices);
  const pdf = useInvoicePdf();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const today = toIsoDate(getNow());
  const isAccountsTeam = canRecordPayments(currentUser);
  const tab: InvoicesTab = isAccountsTeam && searchParams.get('tab') === 'credit-control' ? 'credit-control' : 'invoices';

  const visible = scoped.filter((invoice) => {
    const status = invoiceStatus(invoice, today);
    if (filter === 'unpaid') return status !== 'paid';
    return filter === 'all' || status === filter;
  });
  const openInvoice = openId ? invoices.find((invoice) => invoice.id === openId) : undefined;

  const creditRows = (selectedTenant ? [selectedTenant] : tenants).map((tenant) => ({
    tenant,
    standing: accountStanding(tenant.id, invoices, credit, today),
  }));
  const needingAttention = creditRows.filter((row) => row.standing.stage !== 'good-standing').length;

  const tabItems: TabItem<InvoicesTab>[] = [
    { value: 'invoices', label: 'Invoices', icon: ReceiptText, count: scoped.length },
    { value: 'credit-control', label: 'Credit control', icon: Landmark, count: needingAttention },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description={`Monthly invoices from Checkpoint IT Group${selectedTenant ? ` to ${selectedTenant.name}` : ' across clients'}. Leases, management and software are billed in advance; hardware bought outright follows on the next invoice.`}
      />

      {notice && (
        <div role="status" className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          {notice}
        </div>
      )}
      {pdf.error && (
        <div role="alert" className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rose-600" />
          {pdf.error}
        </div>
      )}

      <InvoiceSummary invoices={scoped} today={today} />

      {isAccountsTeam && (
        <Tabs
          items={tabItems}
          value={tab}
          onChange={(next) => setSearchParams(next === 'invoices' ? {} : { tab: next }, { replace: true })}
          ariaLabel="Billing views"
          controls={TAB_PANEL_ID}
        />
      )}

      {tab === 'invoices' ? (
        <Card id={TAB_PANEL_ID} role={isAccountsTeam ? 'tabpanel' : undefined} className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
            <FilterSelect
              label="Filter by status"
              value={filter}
              options={STATUS_OPTIONS}
              onChange={setFilter}
              active={filter !== 'all'}
            />
            <p aria-live="polite" className="ml-auto text-sm tabular-nums text-slate-500">
              {visible.length} {visible.length === 1 ? 'invoice' : 'invoices'}
            </p>
          </div>
          <InvoicesTable
            invoices={visible}
            today={today}
            showTenant={isGlobalView}
            pendingId={pdf.pendingId}
            onView={setOpenId}
            onDownload={pdf.download}
          />
        </Card>
      ) : (
        <div id={TAB_PANEL_ID} role="tabpanel" className="space-y-6">
          <Card className="overflow-hidden">
            <CreditControlTable
              rows={creditRows}
              invoices={invoices}
              today={today}
              onReleaseHold={(tenant) => {
                releaseHold(tenant.id, today);
                setNotice(`Released the hold on ${tenant.name}. Orders and onboarding are open again; reminders and charges continue.`);
              }}
              onSuspend={(tenant) => {
                suspend(tenant.id, today, currentUser.name);
                setNotice(`Suspended non-essential services for ${tenant.name}. Security monitoring, patching and backups continue.`);
              }}
              onLiftSuspension={(tenant) => {
                liftSuspension(tenant.id);
                setNotice(`Lifted the suspension on ${tenant.name}.`);
              }}
            />
          </Card>
          <CreditPolicyCard />
        </div>
      )}

      {openInvoice && (
        <InvoiceDrawer
          key={openInvoice.id}
          invoice={openInvoice}
          today={today}
          pdfPending={pdf.pendingId === openInvoice.id}
          onDownload={() => pdf.download(openInvoice)}
          onOpenPdf={() => pdf.open(openInvoice)}
          onRecordPayment={() => {
            recordPayment(openInvoice.id, today);
            setNotice(`Recorded payment for ${openInvoice.number} on ${formatDate(today)}.`);
          }}
          onWaiveLateCharges={() => {
            waiveLateCharges(openInvoice.id);
            setNotice(`Waived late payment charges on ${openInvoice.number}.`);
          }}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
