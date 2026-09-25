import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { LATE_CHARGES_AFTER_DAYS } from '../constants/creditControl';
import type { AccountStanding } from '../types/creditControl';

function days(count: number): string {
  return `${count} ${count === 1 ? 'day' : 'days'}`;
}

/** One-sentence explanation of a client's standing, for banners and notices. */
export function describeStanding(standing: AccountStanding, clientName: string): string {
  const oldest = standing.overdue[0];
  const amount = formatMoney(standing.overdueAmount);
  const lateFor = oldest ? `${oldest.number} is ${days(standing.oldestDaysOverdue)} overdue` : '';

  switch (standing.stage) {
    case 'suspended':
      return `${clientName}'s services are suspended since ${formatDate(standing.suspension?.since ?? '')}: support requests, new orders and onboarding are paused until ${amount} is paid. Security monitoring, patching and backups continue.`;
    case 'final-notice':
      return `Final notice: ${lateFor}. New orders and onboarding are paused, and services may be suspended from ${formatDate(standing.suspendableFrom ?? '')} unless ${amount} is paid.`;
    case 'on-hold':
      return `Account on hold: ${lateFor}. New orders and onboarding are paused until ${amount} is paid.`;
    case 'overdue':
      return standing.holdReleased
        ? `${lateFor}. The hold was released while payment is arranged; ${amount} is outstanding.`
        : `${lateFor} (${amount}). Late payment charges apply after ${days(LATE_CHARGES_AFTER_DAYS)}.`;
    case 'good-standing':
      return `${clientName} is in good standing.`;
  }
}
