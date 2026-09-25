import { Card } from '../../../components/ui/Card';
import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import { formatPeriod, periodOf, periodStart, shiftPeriod } from '../utils/billingPeriod';
import { invoiceStatus } from '../utils/invoiceStatus';
import { invoiceTotals } from '../utils/invoiceTotals';

interface InvoiceSummaryProps {
  /** Newest first. */
  invoices: Invoice[];
  today: string;
}

function sumTotals(invoices: Invoice[]): number {
  return invoices.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** Headline billing figures for the current scope (one client, or all of them). */
export function InvoiceSummary({ invoices, today }: InvoiceSummaryProps) {
  const unpaid = invoices.filter((invoice) => invoiceStatus(invoice, today) !== 'paid');
  const overdue = unpaid.filter((invoice) => invoiceStatus(invoice, today) === 'overdue');
  const latestPeriod = invoices[0]?.period;
  const latest = invoices.filter((invoice) => invoice.period === latestPeriod);
  const nextIssue = periodStart(shiftPeriod(periodOf(today), 1));

  const stats = [
    {
      label: 'Outstanding',
      value: formatMoney(sumTotals(unpaid)),
      detail: unpaid.length ? plural(unpaid.length, 'unpaid invoice') : 'Nothing outstanding',
    },
    {
      label: 'Overdue',
      value: formatMoney(sumTotals(overdue)),
      detail: overdue.length ? `${plural(overdue.length, 'invoice')} past the due date` : 'Nothing overdue',
      danger: overdue.length > 0,
    },
    {
      label: latestPeriod ? `${formatPeriod(latestPeriod)} billing` : 'Latest billing',
      value: formatMoney(sumTotals(latest)),
      detail: latest.length > 1 ? `${latest.length} invoices, incl. VAT` : 'Incl. VAT',
    },
    { label: 'Next invoice', value: formatDate(nextIssue), detail: 'Issued automatically on the 1st of each month' },
  ];

  return (
    <Card>
      <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4">
            <dt className="text-sm text-slate-500">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-900">{stat.value}</dd>
            <dd className={stat.danger ? 'mt-0.5 text-xs text-rose-700' : 'mt-0.5 text-xs text-slate-500'}>{stat.detail}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
