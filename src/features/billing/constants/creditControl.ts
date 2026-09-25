/**
 * Credit control policy. Mirror these in the master services agreement: the platform can only enforce
 * what the contract allows.
 */

/**
 * Late Payment of Commercial Debts (Interest) Act 1998: statutory interest is 8% a year above the
 * reference rate, which is the Bank of England base rate on 30 June (for July–December) or
 * 31 December (for January–June).
 */
export const STATUTORY_INTEREST_MARGIN = 8;

/** Placeholder: set to the Bank of England base rate for the current half-year. */
export const REFERENCE_RATE = 4;

export const STATUTORY_INTEREST_RATE = STATUTORY_INTEREST_MARGIN + REFERENCE_RATE;

/** Fixed compensation per late invoice, by the size of the debt (Late Payment Act, s5A). */
export function fixedCompensation(debt: number): number {
  if (debt < 1000) return 40;
  if (debt < 10000) return 70;
  return 100;
}

/** Late-payment charges apply once an invoice is this many days overdue (interest runs from the due date). */
export const LATE_CHARGES_AFTER_DAYS = 7;

/** New orders and onboarding are paused once an invoice is this many days overdue. */
export const HOLD_AFTER_DAYS = 14;

/** A final notice and letter before action are sent at this point. */
export const FINAL_NOTICE_AFTER_DAYS = 30;

/** Written notice given in the final notice before services can be suspended. */
export const SUSPENSION_NOTICE_DAYS = 7;

export interface DunningStep {
  /** Days after the due date. */
  day: number;
  label: string;
  description: string;
}

/** What happens automatically as an invoice goes unpaid. Suspension is never automatic. */
export const DUNNING_STEPS: DunningStep[] = [
  { day: 1, label: 'Payment reminder', description: 'Friendly reminder emailed to the billing contact.' },
  {
    day: LATE_CHARGES_AFTER_DAYS,
    label: 'Second reminder',
    description: `Statutory interest (${STATUTORY_INTEREST_RATE}% a year) and fixed compensation now apply.`,
  },
  { day: HOLD_AFTER_DAYS, label: 'Account on hold', description: 'New orders and onboarding are paused until paid.' },
  {
    day: FINAL_NOTICE_AFTER_DAYS,
    label: 'Final notice',
    description: `Letter before action, with ${SUSPENSION_NOTICE_DAYS} days' written notice of suspension.`,
  },
];
