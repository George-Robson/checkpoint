import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';
import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import type { Tenant } from '../../../types/tenant';
import { ACCOUNT_STAGE_META } from '../constants/accountStageMeta';
import type { AccountStanding } from '../types/creditControl';
import { invoiceStatus } from '../utils/invoiceStatus';
import { invoiceTotals } from '../utils/invoiceTotals';
import { daysOverdue } from '../utils/lateCharges';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

/** Aged debt buckets: unpaid amounts by how far past the due date they are. */
const BUCKETS = [
  { label: 'Not yet due', min: -Infinity, max: 0 },
  { label: '1–30 days', min: 1, max: 30 },
  { label: '31–60 days', min: 31, max: 60 },
  { label: '61–90 days', min: 61, max: 90 },
  { label: '90+ days', min: 91, max: Infinity },
];

export interface CreditControlRow {
  tenant: Tenant;
  standing: AccountStanding;
}

interface CreditControlTableProps {
  rows: CreditControlRow[];
  invoices: Invoice[];
  today: string;
  onReleaseHold: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
  onLiftSuspension: (tenant: Tenant) => void;
}

function standingDetail(standing: AccountStanding): string {
  if (standing.suspension) return `Since ${formatDate(standing.suspension.since)} · ${standing.suspension.by}`;
  if (standing.canSuspend) return `Notice ran out ${formatDate(standing.suspendableFrom ?? '')}`;
  if (standing.suspendableFrom) return `Suspension possible from ${formatDate(standing.suspendableFrom)}`;
  if (standing.holdReleased) return 'Hold released · payment arranged';
  if (standing.overdue.length) return `Oldest ${standing.oldestDaysOverdue} days overdue`;
  return 'Nothing overdue';
}

/** Aged debt per client, with the decisions only Checkpoint's accounts team can make. */
export function CreditControlTable({ rows, invoices, today, onReleaseHold, onSuspend, onLiftSuspension }: CreditControlTableProps) {
  const [confirmingSuspend, setConfirmingSuspend] = useState<string | null>(null);

  const agedDebt = (tenantId: string) => {
    const unpaid = invoices.filter((invoice) => invoice.tenantId === tenantId && invoiceStatus(invoice, today) !== 'paid');
    return BUCKETS.map((bucket) =>
      unpaid
        .filter((invoice) => {
          const late = invoice.dueOn < today ? daysOverdue(invoice, today) : 0;
          return late >= bucket.min && late <= bucket.max;
        })
        .reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0),
    );
  };
  const aged = rows.map((row) => agedDebt(row.tenant.id));
  const bucketTotals = BUCKETS.map((_, index) => aged.reduce((sum, amounts) => sum + amounts[index], 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Client
            </th>
            {BUCKETS.map((bucket) => (
              <th key={bucket.label} scope="col" className={cn(HEADER_CELL, 'text-right')}>
                {bucket.label}
              </th>
            ))}
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Outstanding
            </th>
            <th scope="col" className={HEADER_CELL}>
              Standing
            </th>
            <th scope="col" className={HEADER_CELL}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(({ tenant, standing }, rowIndex) => {
            const amounts = aged[rowIndex];
            const outstanding = amounts.reduce((sum, amount) => sum + amount, 0);
            const { label, tone } = ACCOUNT_STAGE_META[standing.stage];
            return (
              <tr key={tenant.id} className="hover:bg-slate-50">
                <td className={cn(CELL, 'whitespace-nowrap font-medium text-slate-900')}>{tenant.name}</td>
                {amounts.map((amount, index) => (
                  <td
                    key={BUCKETS[index].label}
                    className={cn(
                      CELL,
                      'whitespace-nowrap text-right tabular-nums',
                      amount === 0 ? 'text-slate-400' : index >= 2 ? 'text-rose-700' : 'text-slate-700',
                    )}
                  >
                    {amount === 0 ? '—' : formatMoney(amount)}
                  </td>
                ))}
                <td className={cn(CELL, 'whitespace-nowrap text-right font-medium tabular-nums text-slate-900')}>
                  {formatMoney(outstanding)}
                </td>
                <td className={CELL}>
                  <Badge tone={tone}>{label}</Badge>
                  <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{standingDetail(standing)}</p>
                </td>
                <td className={cn(CELL, 'text-right')}>
                  <div className="flex justify-end gap-2">
                    {(standing.stage === 'on-hold' || standing.stage === 'final-notice') && (
                      <Button variant="secondary" size="sm" onClick={() => onReleaseHold(tenant)}>
                        Release hold
                      </Button>
                    )}
                    {standing.canSuspend && (
                      <Button
                        variant={confirmingSuspend === tenant.id ? 'danger' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          if (confirmingSuspend !== tenant.id) {
                            setConfirmingSuspend(tenant.id);
                            return;
                          }
                          setConfirmingSuspend(null);
                          onSuspend(tenant);
                        }}
                      >
                        {confirmingSuspend === tenant.id ? 'Confirm suspension' : 'Suspend services'}
                      </Button>
                    )}
                    {standing.suspension && (
                      <Button variant="secondary" size="sm" onClick={() => onLiftSuspension(tenant)}>
                        Lift suspension
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        {rows.length > 1 && (
          <tfoot className="border-t border-slate-200 bg-slate-50">
            <tr>
              <th scope="row" className={cn(CELL, 'text-left font-medium text-slate-900')}>
                Total
              </th>
              {bucketTotals.map((amount, index) => (
                <td key={BUCKETS[index].label} className={cn(CELL, 'whitespace-nowrap text-right font-medium tabular-nums text-slate-900')}>
                  {amount === 0 ? '—' : formatMoney(amount)}
                </td>
              ))}
              <td className={cn(CELL, 'whitespace-nowrap text-right font-medium tabular-nums text-slate-900')}>
                {formatMoney(bucketTotals.reduce((sum, amount) => sum + amount, 0))}
              </td>
              <td className={CELL} colSpan={2} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
