import { createContext } from 'react';
import type { Invoice } from '../../../types/invoice';
import type { BillingSources } from '../types/billingSources';
import type { CreditControlState } from '../types/creditControl';

export interface InvoicesContextValue {
  /** Newest first. */
  invoices: Invoice[];
  credit: CreditControlState;
  /** Issues every monthly invoice that has fallen due by `today`, built from the current data. */
  issueDue: (today: string, sources: BillingSources) => Invoice[];
  recordPayment: (invoiceId: string, paidOn: string) => void;
  /** Goodwill: no (further) late-payment charges on this invoice. */
  waiveLateCharges: (invoiceId: string) => void;
  /** Lifts the hold on a client's current overdue invoices, e.g. once a payment plan is agreed. */
  releaseHold: (tenantId: string, today: string) => void;
  suspend: (tenantId: string, since: string, by: string) => void;
  liftSuspension: (tenantId: string) => void;
}

export const InvoicesContext = createContext<InvoicesContextValue | null>(null);
