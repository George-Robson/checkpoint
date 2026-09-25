import { Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';
import { formatMoney } from '../../../lib/currency';
import { addDays, formatDate, parseDate, toIsoDate } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import {
  DUNNING_STEPS,
  FINAL_NOTICE_AFTER_DAYS,
  LATE_CHARGES_AFTER_DAYS,
  STATUTORY_INTEREST_RATE,
  SUSPENSION_NOTICE_DAYS,
} from '../constants/creditControl';
import { daysOverdue, unbilledLateCharges } from '../utils/lateCharges';

interface LateChargesSectionProps {
  invoice: Invoice;
  today: string;
  canWaive: boolean;
  onWaive: () => void;
}

/** For an overdue invoice: the reminders sent so far and the late-payment charges building up. */
export function LateChargesSection({ invoice, today, canWaive, onWaive }: LateChargesSectionProps) {
  const overdueDays = daysOverdue(invoice, today);
  const charges = unbilledLateCharges(invoice, today);
  const unbilled = charges.interest + charges.compensation;
  const dateAfterDue = (days: number) => toIsoDate(addDays(parseDate(invoice.dueOn), days));

  const steps = [
    ...DUNNING_STEPS.map((step) => ({ key: step.label, label: step.label, description: step.description, day: step.day })),
    {
      key: 'suspension',
      label: 'Suspension possible',
      description: 'Checkpoint may suspend non-essential services. Never automatic.',
      day: FINAL_NOTICE_AFTER_DAYS + SUSPENSION_NOTICE_DAYS,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-3 py-2.5">
          <h3 className="text-sm font-medium text-slate-900">Late payment charges</h3>
          {canWaive && !invoice.lateChargesWaived && overdueDays >= LATE_CHARGES_AFTER_DAYS && (
            <Button variant="ghost" size="sm" onClick={onWaive}>
              Waive charges
            </Button>
          )}
        </div>
        <div className="space-y-1 px-3 py-2.5 text-sm">
          {invoice.lateChargesWaived ? (
            <p className="text-slate-500">Waived: no further late payment charges on this invoice.</p>
          ) : overdueDays < LATE_CHARGES_AFTER_DAYS ? (
            <p className="text-slate-500">
              None yet. From day {LATE_CHARGES_AFTER_DAYS} ({formatDate(dateAfterDue(LATE_CHARGES_AFTER_DAYS))}), statutory
              interest at {STATUTORY_INTEREST_RATE}% a year and fixed compensation apply.
            </p>
          ) : (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Interest · {charges.interestDays} days at {STATUTORY_INTEREST_RATE}% a year
                </span>
                <span className="tabular-nums text-slate-900">{formatMoney(charges.interest)}</span>
              </div>
              {charges.compensation > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Fixed compensation</span>
                  <span className="tabular-nums text-slate-900">{formatMoney(charges.compensation)}</span>
                </div>
              )}
              <p className="pt-1 text-xs text-slate-500">
                {unbilled > 0 ? `${formatMoney(unbilled)} so far, ` : ''}
                added to the next invoice. Interest keeps accruing daily until paid
                {invoice.interestBilledThrough ? `; billed up to ${formatDate(invoice.interestBilledThrough)} already` : ''}.
              </p>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-slate-500">Credit control</h3>
        <ol className="mt-2 space-y-2.5">
          {steps.map((step) => {
            const on = dateAfterDue(step.day);
            const reached = overdueDays >= step.day;
            return (
              <li key={step.key} className="flex gap-3 text-sm">
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border',
                    reached ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white',
                  )}
                >
                  {reached && <Check aria-hidden="true" className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span className={reached ? 'font-medium text-slate-900' : 'text-slate-500'}>{step.label}</span>
                  <span className="text-xs text-slate-500"> · {reached ? formatDate(on) : `from ${formatDate(on)}`}</span>
                  <span className="block text-xs text-slate-500">{step.description}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
