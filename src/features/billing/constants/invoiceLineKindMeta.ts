import type { InvoiceLineKind } from '../../../types/invoice';

export const INVOICE_LINE_KIND_ORDER: InvoiceLineKind[] = [
  'hardware-lease',
  'cloud',
  'device-management',
  'software',
  'hardware-purchase',
  'late-payment',
];

export const INVOICE_LINE_KIND_META: Record<InvoiceLineKind, { label: string }> = {
  'hardware-lease': { label: 'Hardware leases' },
  cloud: { label: 'Managed cloud servers' },
  'device-management': { label: 'Management of owned devices' },
  software: { label: 'Software licences' },
  'hardware-purchase': { label: 'Hardware purchases' },
  'late-payment': { label: 'Late payment charges (outside the scope of VAT)' },
};
