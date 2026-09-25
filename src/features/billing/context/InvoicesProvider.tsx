import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { tenants } from '../../../data/mockData';
import type { Invoice } from '../../../types/invoice';
import type { BillingSources } from '../types/billingSources';
import type { CreditControlState } from '../types/creditControl';
import { periodOf, periodsBetween, shiftPeriod } from '../utils/billingPeriod';
import { buildInvoice } from '../utils/buildInvoice';
import { invoiceStatus } from '../utils/invoiceStatus';
import { applyLateCharges } from '../utils/lateCharges';
import { seedInvoices } from '../utils/seedInvoices';
import { InvoicesContext, type InvoicesContextValue } from './InvoicesContext';

function newestFirst(a: Invoice, b: Invoice): number {
  return b.issuedOn.localeCompare(a.issuedOn) || a.number.localeCompare(b.number);
}

const INITIAL_CREDIT: CreditControlState = { suspensions: {}, releasedHoldInvoiceIds: [] };

interface InvoicesProviderProps {
  children: ReactNode;
}

/**
 * In-memory invoices and credit control: seeded history, plus one invoice per client each month as the demo
 * clock moves on, with any late-payment charges carried onto it.
 */
export function InvoicesProvider({ children }: InvoicesProviderProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => seedInvoices().sort(newestFirst));
  const [credit, setCredit] = useState<CreditControlState>(INITIAL_CREDIT);
  // Mirrors state synchronously so several updates in one event build on each other.
  const invoicesRef = useRef(invoices);

  const commit = useCallback((next: Invoice[]) => {
    invoicesRef.current = next;
    setInvoices(next);
  }, []);

  const updateInvoice = useCallback(
    (invoiceId: string, changes: Partial<Invoice>) => {
      commit(invoicesRef.current.map((invoice) => (invoice.id === invoiceId ? { ...invoice, ...changes } : invoice)));
    },
    [commit],
  );

  const issueDue = useCallback(
    (today: string, sources: BillingSources): Invoice[] => {
      const currentPeriod = periodOf(today);
      let all = invoicesRef.current;
      const issued: Invoice[] = [];

      for (const tenant of tenants) {
        const latest = all.find((invoice) => invoice.tenantId === tenant.id)?.period;
        const from = latest ? shiftPeriod(latest, 1) : currentPeriod;
        for (const period of periodsBetween(from, currentPeriod)) {
          const { invoice, earlier } = applyLateCharges(buildInvoice(tenant, period, sources), all);
          all = [invoice, ...earlier];
          issued.push(invoice);
        }
      }

      if (issued.length > 0) commit([...all].sort(newestFirst));
      return issued;
    },
    [commit],
  );

  const recordPayment = useCallback(
    (invoiceId: string, paidOn: string) => updateInvoice(invoiceId, { paidOn }),
    [updateInvoice],
  );

  const waiveLateCharges = useCallback(
    (invoiceId: string) => updateInvoice(invoiceId, { lateChargesWaived: true }),
    [updateInvoice],
  );

  const releaseHold = useCallback((tenantId: string, today: string) => {
    const overdueIds = invoicesRef.current
      .filter((invoice) => invoice.tenantId === tenantId && invoiceStatus(invoice, today) === 'overdue')
      .map((invoice) => invoice.id);
    setCredit((previous) => ({
      ...previous,
      releasedHoldInvoiceIds: [...new Set([...previous.releasedHoldInvoiceIds, ...overdueIds])],
    }));
  }, []);

  const suspend = useCallback((tenantId: string, since: string, by: string) => {
    setCredit((previous) => ({ ...previous, suspensions: { ...previous.suspensions, [tenantId]: { since, by } } }));
  }, []);

  const liftSuspension = useCallback((tenantId: string) => {
    setCredit((previous) => {
      const suspensions = { ...previous.suspensions };
      delete suspensions[tenantId];
      return { ...previous, suspensions };
    });
  }, []);

  const value = useMemo<InvoicesContextValue>(
    () => ({ invoices, credit, issueDue, recordPayment, waiveLateCharges, releaseHold, suspend, liftSuspension }),
    [invoices, credit, issueDue, recordPayment, waiveLateCharges, releaseHold, suspend, liftSuspension],
  );

  return <InvoicesContext value={value}>{children}</InvoicesContext>;
}
