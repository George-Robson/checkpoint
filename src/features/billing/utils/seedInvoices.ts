import {
  devices,
  kits,
  LATE_PAID_INVOICES,
  licencePools,
  MOCK_NOW,
  orders,
  tenants,
  UNPAID_INVOICE_PERIODS,
} from '../../../data/mockData';
import { addDays, parseDate, toIsoDate } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import { INVOICE_HISTORY_MONTHS } from '../constants/billing';
import { periodOf, periodsBetween, shiftPeriod } from './billingPeriod';
import { buildInvoice } from './buildInvoice';
import { applyLateCharges } from './lateCharges';

/** Days after issue that each client usually pays, so the seeded history varies a little. */
const PAYMENT_DELAY_DAYS = [9, 14, 6, 18, 11];

/**
 * The invoice history up to MOCK_NOW: up to a year per client, from the month they joined. Built month by
 * month so late payments are charged on the following invoice, as they would have been.
 */
export function seedInvoices(): Invoice[] {
  const currentPeriod = periodOf(MOCK_NOW);
  const earliest = shiftPeriod(currentPeriod, -(INVOICE_HISTORY_MONTHS - 1));
  const sources = { devices, pools: licencePools, orders, kits };

  return tenants.flatMap((tenant, index) => {
    const joined = periodOf(tenant.onboardedAt);
    let history: Invoice[] = [];

    for (const period of periodsBetween(joined > earliest ? joined : earliest, currentPeriod)) {
      const built = buildInvoice(tenant, period, sources);
      const onTime = toIsoDate(addDays(parseDate(built.issuedOn), PAYMENT_DELAY_DAYS[index % PAYMENT_DELAY_DAYS.length]));
      const unpaid = UNPAID_INVOICE_PERIODS[tenant.id]?.includes(period);
      const paidOn = unpaid ? null : (LATE_PAID_INVOICES[tenant.id]?.[period] ?? onTime);

      const { invoice, earlier } = applyLateCharges({ ...built, paidOn }, history);
      history = [...earlier, invoice];
    }
    return history;
  });
}
