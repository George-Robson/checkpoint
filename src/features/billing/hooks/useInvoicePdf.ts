import { useState } from 'react';
import { getNow, toIsoDate } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import { getTenant } from '../../tenants/utils/tenantLookup';
import { invoiceStatus } from '../utils/invoiceStatus';

/** Object URLs are revoked after this long; enough for the browser to open or save the file. */
const URL_LIFETIME_MS = 60_000;

async function createPdfUrl(invoice: Invoice): Promise<string> {
  const tenant = getTenant(invoice.tenantId);
  if (!tenant) throw new Error(`Unknown client ${invoice.tenantId}`);
  const { renderInvoicePdf } = await import('../pdf/renderInvoicePdf');
  const blob = await renderInvoicePdf(invoice, tenant, invoiceStatus(invoice, toIsoDate(getNow())));
  const url = URL.createObjectURL(blob);
  window.setTimeout(() => URL.revokeObjectURL(url), URL_LIFETIME_MS);
  return url;
}

/** Generates invoice PDFs in the browser on demand, to download or open in a new tab. */
export function useInvoicePdf() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(invoice: Invoice, deliver: (url: string) => void, onFail?: () => void) {
    setPendingId(invoice.id);
    setError(null);
    try {
      deliver(await createPdfUrl(invoice));
    } catch {
      onFail?.();
      setError(`Couldn't generate ${invoice.number}. Please try again.`);
    } finally {
      setPendingId(null);
    }
  }

  function download(invoice: Invoice) {
    void run(invoice, (url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.number}.pdf`;
      link.click();
    });
  }

  function open(invoice: Invoice) {
    // Open the tab now, while we still have the click, so pop-up blockers allow it; fill it once rendered.
    const tab = window.open('', '_blank');
    void run(
      invoice,
      (url) => {
        if (tab) tab.location.href = url;
        else window.location.assign(url);
      },
      () => tab?.close(),
    );
  }

  return { download, open, pendingId, error };
}
