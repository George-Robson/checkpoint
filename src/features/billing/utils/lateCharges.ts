import { daysBetween, formatDate, parseDate } from '../../../lib/date';
import type { Invoice, InvoiceLine } from '../../../types/invoice';
import { fixedCompensation, LATE_CHARGES_AFTER_DAYS, STATUTORY_INTEREST_RATE } from '../constants/creditControl';
import { debtAmount } from './invoiceTotals';

export interface LateCharges {
  /** Days of interest not yet billed. */
  interestDays: number;
  interest: number;
  /** 0 once billed (it's charged once per invoice). */
  compensation: number;
  /** The date the unbilled interest runs to: payment, or `asOf` while unpaid. */
  through: string;
}

const NO_CHARGES: LateCharges = { interestDays: 0, interest: 0, compensation: 0, through: '' };

/** Days an invoice was (or has been) overdue as of a date: stops counting when it's paid. */
export function daysOverdue(invoice: Invoice, asOf: string): number {
  const end = invoice.paidOn && invoice.paidOn < asOf ? invoice.paidOn : asOf;
  return Math.max(0, daysBetween(parseDate(invoice.dueOn), parseDate(end)));
}

/**
 * Late-payment charges on an invoice that haven't been billed yet: simple daily statutory interest on the
 * debt from the due date, plus the one-off fixed compensation. Nothing applies inside the grace period.
 */
export function unbilledLateCharges(invoice: Invoice, asOf: string): LateCharges {
  const overdue = daysOverdue(invoice, asOf);
  if (invoice.lateChargesWaived || overdue < LATE_CHARGES_AFTER_DAYS) return NO_CHARGES;

  const through = invoice.paidOn && invoice.paidOn < asOf ? invoice.paidOn : asOf;
  const from = invoice.interestBilledThrough ?? invoice.dueOn;
  const interestDays = Math.max(0, daysBetween(parseDate(from), parseDate(through)));
  const debt = debtAmount(invoice);
  return {
    interestDays,
    interest: Math.round(((debt * (STATUTORY_INTEREST_RATE / 100) * interestDays) / 365) * 100) / 100,
    compensation: invoice.compensationBilled ? 0 : fixedCompensation(debt),
    through,
  };
}

/**
 * Adds the unbilled late-payment charges on a client's earlier invoices to a new invoice, and marks them as
 * billed on those invoices.
 */
export function applyLateCharges(invoice: Invoice, earlier: Invoice[]): { invoice: Invoice; earlier: Invoice[] } {
  const lines: InvoiceLine[] = [];
  const updated = earlier.map((previous) => {
    if (previous.tenantId !== invoice.tenantId) return previous;
    const charges = unbilledLateCharges(previous, invoice.issuedOn);
    if (charges.interest === 0 && charges.compensation === 0) return previous;

    if (charges.interest > 0) {
      lines.push({
        kind: 'late-payment',
        description: `Interest on ${previous.number}`,
        detail: `${charges.interestDays} days to ${formatDate(charges.through)} at ${STATUTORY_INTEREST_RATE}% a year`,
        quantity: 1,
        unitPrice: charges.interest,
      });
    }
    if (charges.compensation > 0) {
      lines.push({
        kind: 'late-payment',
        description: `Fixed compensation on ${previous.number}`,
        detail: 'Late Payment of Commercial Debts (Interest) Act 1998',
        quantity: 1,
        unitPrice: charges.compensation,
      });
    }
    return { ...previous, interestBilledThrough: charges.through, compensationBilled: true };
  });

  return { invoice: { ...invoice, lines: [...invoice.lines, ...lines] }, earlier: updated };
}
