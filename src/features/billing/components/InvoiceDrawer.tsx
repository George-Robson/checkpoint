import { Download, ExternalLink, LoaderCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { formatMoney } from '../../../lib/currency';
import { formatDate, formatRelativeDay } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import { useSession } from '../../session/hooks/useSession';
import { canRecordPayments } from '../../session/utils/permissions';
import { getTenant } from '../../tenants/utils/tenantLookup';
import { VAT_RATE } from '../constants/billing';
import { COMPANY_DETAILS } from '../constants/companyDetails';
import { INVOICE_LINE_KIND_META, INVOICE_LINE_KIND_ORDER } from '../constants/invoiceLineKindMeta';
import { formatPeriod } from '../utils/billingPeriod';
import { invoiceStatus } from '../utils/invoiceStatus';
import { invoiceTotals, lineAmount } from '../utils/invoiceTotals';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { LateChargesSection } from './LateChargesSection';

interface InvoiceDrawerProps {
  invoice: Invoice;
  today: string;
  pdfPending: boolean;
  onDownload: () => void;
  onOpenPdf: () => void;
  onRecordPayment: () => void;
  onWaiveLateCharges: () => void;
  onClose: () => void;
}

/** An invoice's lines and totals, with the branded PDF a click away. */
export function InvoiceDrawer({
  invoice,
  today,
  pdfPending,
  onDownload,
  onOpenPdf,
  onRecordPayment,
  onWaiveLateCharges,
  onClose,
}: InvoiceDrawerProps) {
  const { currentUser } = useSession();
  const tenant = getTenant(invoice.tenantId);
  const status = invoiceStatus(invoice, today);
  const totals = invoiceTotals(invoice);

  const statusText =
    status === 'paid' && invoice.paidOn
      ? `Paid on ${formatDate(invoice.paidOn)}`
      : status === 'overdue'
        ? `Was due ${formatDate(invoice.dueOn)} (${formatRelativeDay(invoice.dueOn)})`
        : `Due ${formatDate(invoice.dueOn)} (${formatRelativeDay(invoice.dueOn)})`;

  const PdfIcon = pdfPending ? LoaderCircle : Download;

  return (
    <Drawer
      title={invoice.number}
      description={`${formatPeriod(invoice.period)} · ${tenant?.name ?? invoice.tenantId}`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            {status !== 'paid' && canRecordPayments(currentUser) && (
              <Button variant="ghost" onClick={onRecordPayment}>
                Record payment
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onOpenPdf} disabled={pdfPending}>
              <ExternalLink aria-hidden="true" className="size-4" />
              Open PDF
            </Button>
            <Button onClick={onDownload} disabled={pdfPending}>
              <PdfIcon aria-hidden="true" className={pdfPending ? 'size-4 animate-spin' : 'size-4'} />
              {pdfPending ? 'Generating…' : 'Download PDF'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <InvoiceStatusBadge status={status} />
          <p className={status === 'overdue' ? 'text-sm text-rose-700' : 'text-sm text-slate-500'}>{statusText}</p>
        </div>

        {status === 'overdue' && (
          <LateChargesSection
            invoice={invoice}
            today={today}
            canWaive={canRecordPayments(currentUser)}
            onWaive={onWaiveLateCharges}
          />
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ['Bill to', tenant ? `${tenant.name} · Attn ${tenant.primaryContact}` : invoice.tenantId],
            ['Billing period', formatPeriod(invoice.period)],
            ['Issued', formatDate(invoice.issuedOn)],
            ['Due', formatDate(invoice.dueOn)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-5">
          {INVOICE_LINE_KIND_ORDER.map((kind) => {
            const lines = invoice.lines.filter((line) => line.kind === kind);
            if (lines.length === 0) return null;
            const sectionTotal = lines.reduce((sum, line) => sum + lineAmount(line), 0);
            return (
              <section key={kind}>
                <h3 className="flex justify-between gap-4 text-xs font-medium text-slate-500">
                  {INVOICE_LINE_KIND_META[kind].label}
                  <span className="tabular-nums">{formatMoney(sectionTotal)}</span>
                </h3>
                <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {lines.map((line) => (
                    <li key={`${line.description}-${line.detail}`} className="flex items-start justify-between gap-4 px-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="text-slate-900">{line.description}</p>
                        {line.detail && <p className="text-xs text-slate-500">{line.detail}</p>}
                      </div>
                      <div className="shrink-0 text-right tabular-nums">
                        <p className="text-slate-900">{formatMoney(lineAmount(line))}</p>
                        <p className="text-xs text-slate-500">
                          {line.quantity} × {formatMoney(line.unitPrice)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="tabular-nums text-slate-900">{formatMoney(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">
              VAT at {VAT_RATE * 100}%
              {totals.vatable !== totals.subtotal && ` on ${formatMoney(totals.vatable)}`}
            </dt>
            <dd className="tabular-nums text-slate-900">{formatMoney(totals.vat)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-3">
            <dt className="font-medium text-slate-900">{status === 'paid' ? 'Total' : 'Total due'}</dt>
            <dd className="text-lg font-semibold tabular-nums text-slate-900">{formatMoney(totals.total)}</dd>
          </div>
        </dl>

        {status !== 'paid' && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">Pay by bank transfer</p>
            <p className="mt-1">
              {COMPANY_DETAILS.bank.accountName} · Sort code {COMPANY_DETAILS.bank.sortCode} · Account{' '}
              {COMPANY_DETAILS.bank.accountNumber}. Use {invoice.number} as the reference.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
