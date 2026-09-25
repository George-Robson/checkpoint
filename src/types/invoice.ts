/** Invoice sections, in the order they're printed. */
export type InvoiceLineKind =
  | 'hardware-lease'
  | 'cloud'
  | 'device-management'
  | 'software'
  | 'hardware-purchase'
  | 'late-payment';

export interface InvoiceLine {
  kind: InvoiceLineKind;
  description: string;
  /** Secondary text, e.g. an order reference or what a charge covers. */
  detail?: string;
  quantity: number;
  /** Ex. VAT. */
  unitPrice: number;
}

/**
 * A monthly invoice from Checkpoint to one client. Recurring charges are billed in advance for the month;
 * one-off hardware purchases ordered the month before, and any late-payment charges, are added to it.
 * Lines are fixed once issued.
 */
export interface Invoice {
  id: string;
  number: string;
  tenantId: string;
  /** The month billed, YYYY-MM. */
  period: string;
  issuedOn: string;
  dueOn: string;
  lines: InvoiceLine[];
  paidOn: string | null;
  /** Statutory interest on this invoice has been billed up to this date (null = none yet). */
  interestBilledThrough: string | null;
  /** The fixed late-payment compensation for this invoice has been billed. */
  compensationBilled: boolean;
  /** Late-payment charges waived as a goodwill gesture. */
  lateChargesWaived: boolean;
}

/** Derived from the dates: unpaid invoices are 'due' until their due date passes. */
export type InvoiceStatus = 'paid' | 'due' | 'overdue';
