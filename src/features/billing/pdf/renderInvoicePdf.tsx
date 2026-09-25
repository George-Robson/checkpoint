import { pdf } from '@react-pdf/renderer';
import type { Invoice, InvoiceStatus } from '../../../types/invoice';
import type { Tenant } from '../../../types/tenant';
import { InvoiceDocument } from './InvoiceDocument';

/** Loaded on demand (the PDF renderer is large), so importing this module is what pulls it in. */
export function renderInvoicePdf(invoice: Invoice, tenant: Tenant, status: InvoiceStatus): Promise<Blob> {
  return pdf(<InvoiceDocument invoice={invoice} tenant={tenant} status={status} />).toBlob();
}
