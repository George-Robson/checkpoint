import type { Invoice, InvoiceLine } from '../../../types/invoice';
import { VAT_RATE } from '../constants/billing';

function roundPence(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function lineAmount(line: InvoiceLine): number {
  return roundPence(line.quantity * line.unitPrice);
}

/** Statutory interest and compensation are outside the scope of VAT. */
function isVatable(line: InvoiceLine): boolean {
  return line.kind !== 'late-payment';
}

export interface InvoiceTotals {
  /** All lines, ex. VAT. */
  subtotal: number;
  /** The part of the subtotal VAT is charged on. */
  vatable: number;
  vat: number;
  total: number;
}

export function invoiceTotals(invoice: Invoice): InvoiceTotals {
  const subtotal = roundPence(invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0));
  const vatable = roundPence(invoice.lines.filter(isVatable).reduce((sum, line) => sum + lineAmount(line), 0));
  const vat = roundPence(vatable * VAT_RATE);
  return { subtotal, vatable, vat, total: roundPence(subtotal + vat) };
}

/** The debt late-payment charges are worked out on: the invoice's own charges incl. VAT, not earlier late charges. */
export function debtAmount(invoice: Invoice): number {
  const { vatable, vat } = invoiceTotals(invoice);
  return roundPence(vatable + vat);
}
