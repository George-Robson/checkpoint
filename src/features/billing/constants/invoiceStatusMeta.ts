import type { Tone } from '../../../components/ui/tone';
import type { InvoiceStatus } from '../../../types/invoice';

export const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['overdue', 'due', 'paid'];

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  paid: { label: 'Paid', tone: 'emerald' },
  due: { label: 'Due', tone: 'amber' },
  overdue: { label: 'Overdue', tone: 'rose' },
};
