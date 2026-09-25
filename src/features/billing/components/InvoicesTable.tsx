import { Download, LoaderCircle, ReceiptText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { formatMoney } from '../../../lib/currency';
import { formatDate, formatRelativeDay } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { formatPeriod } from '../utils/billingPeriod';
import { invoiceStatus } from '../utils/invoiceStatus';
import { invoiceTotals } from '../utils/invoiceTotals';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface InvoicesTableProps {
  invoices: Invoice[];
  today: string;
  showTenant: boolean;
  pendingId: string | null;
  onView: (invoiceId: string) => void;
  onDownload: (invoice: Invoice) => void;
}

export function InvoicesTable({ invoices, today, showTenant, pendingId, onView, onDownload }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return <EmptyState icon={ReceiptText} title="No invoices" description="Nothing matches this filter." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Invoice
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={HEADER_CELL}>
              Issued
            </th>
            <th scope="col" className={HEADER_CELL}>
              Due
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Amount
            </th>
            <th scope="col" className={HEADER_CELL}>
              Status
            </th>
            <th scope="col" className={HEADER_CELL}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => {
            const status = invoiceStatus(invoice, today);
            const totals = invoiceTotals(invoice);
            const pending = pendingId === invoice.id;
            return (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className={CELL}>
                  <button
                    type="button"
                    onClick={() => onView(invoice.id)}
                    className="whitespace-nowrap font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {invoice.number}
                  </button>
                  <p className="whitespace-nowrap text-xs text-slate-500">{formatPeriod(invoice.period)}</p>
                </td>
                {showTenant && (
                  <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(invoice.tenantId)}</td>
                )}
                <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{formatDate(invoice.issuedOn)}</td>
                <td className={CELL}>
                  <p className="whitespace-nowrap text-slate-700">{formatDate(invoice.dueOn)}</p>
                  {status !== 'paid' && (
                    <p className={cn('whitespace-nowrap text-xs', status === 'overdue' ? 'text-rose-700' : 'text-slate-500')}>
                      {formatRelativeDay(invoice.dueOn)}
                    </p>
                  )}
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums')}>
                  <p className="text-slate-900">{formatMoney(totals.total)}</p>
                  <p className="text-xs text-slate-500">{formatMoney(totals.subtotal)} ex. VAT</p>
                </td>
                <td className={CELL}>
                  <InvoiceStatusBadge status={status} />
                  {invoice.paidOn && (
                    <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{formatDate(invoice.paidOn)}</p>
                  )}
                </td>
                <td className={cn(CELL, 'text-right')}>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onView(invoice.id)}>
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(invoice)}
                      disabled={pending}
                      aria-label={`Download ${invoice.number} as PDF`}
                    >
                      {pending ? (
                        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
                      ) : (
                        <Download aria-hidden="true" className="size-3.5" />
                      )}
                      PDF
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
