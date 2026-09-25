import { addDays, parseDate, toIsoDate } from '../../../lib/date';
import type { Invoice } from '../../../types/invoice';
import { FINAL_NOTICE_AFTER_DAYS, HOLD_AFTER_DAYS, SUSPENSION_NOTICE_DAYS } from '../constants/creditControl';
import type { AccountStage, AccountStanding, CreditControlState } from '../types/creditControl';
import { invoiceStatus } from './invoiceStatus';
import { invoiceTotals } from './invoiceTotals';
import { daysOverdue } from './lateCharges';

/** Where a client stands with Checkpoint, from its oldest unpaid invoice and any decisions on the account. */
export function accountStanding(
  tenantId: string,
  invoices: Invoice[],
  credit: CreditControlState,
  today: string,
): AccountStanding {
  const overdue = invoices
    .filter((invoice) => invoice.tenantId === tenantId && invoiceStatus(invoice, today) === 'overdue')
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  const oldest = overdue[0];
  const oldestDaysOverdue = oldest ? daysOverdue(oldest, today) : 0;
  const suspension = credit.suspensions[tenantId] ?? null;

  const holding = overdue.filter((invoice) => daysOverdue(invoice, today) >= HOLD_AFTER_DAYS);
  const held = holding.filter((invoice) => !credit.releasedHoldInvoiceIds.includes(invoice.id));
  const holdReleased = holding.length > 0 && held.length === 0;
  const heldDays = held[0] ? daysOverdue(held[0], today) : 0;

  let stage: AccountStage = 'good-standing';
  if (suspension) stage = 'suspended';
  else if (held.length > 0) stage = heldDays >= FINAL_NOTICE_AFTER_DAYS ? 'final-notice' : 'on-hold';
  else if (overdue.length > 0) stage = 'overdue';

  const suspendableFrom =
    held[0] && heldDays >= FINAL_NOTICE_AFTER_DAYS
      ? toIsoDate(addDays(parseDate(held[0].dueOn), FINAL_NOTICE_AFTER_DAYS + SUSPENSION_NOTICE_DAYS))
      : null;

  return {
    tenantId,
    stage,
    overdue,
    overdueAmount: overdue.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0),
    oldestDaysOverdue,
    holdReleased,
    restricted: stage === 'on-hold' || stage === 'final-notice' || stage === 'suspended',
    canSuspend: !suspension && suspendableFrom !== null && suspendableFrom <= today,
    suspendableFrom,
    suspension,
  };
}
