import { getNow, toIsoDate } from '../../../lib/date';
import type { AccountStanding } from '../types/creditControl';
import { accountStanding } from '../utils/accountStanding';
import { useInvoices } from './useInvoices';

/** A client's credit standing today; null when no client is given (e.g. Global View). */
export function useAccountStanding(tenantId: string | null | undefined): AccountStanding | null {
  const { invoices, credit } = useInvoices();
  if (!tenantId) return null;
  return accountStanding(tenantId, invoices, credit, toIsoDate(getNow()));
}
