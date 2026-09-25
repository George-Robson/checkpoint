import type { Invoice, InvoiceStatus } from '../../../types/invoice';

export function invoiceStatus(invoice: Invoice, today: string): InvoiceStatus {
  if (invoice.paidOn) return 'paid';
  return invoice.dueOn < today ? 'overdue' : 'due';
}
