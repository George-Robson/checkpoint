import { formatMinutes } from '../../helpdesk/utils/ticketSla';

/** Formatting shared by the on-screen report and its PDF. */
export function formatShare(share: number | null): string {
  return share === null ? '—' : `${Math.round(share * 100)}%`;
}

export function formatResponse(minutes: number | null): string {
  return minutes === null ? '—' : formatMinutes(minutes);
}
