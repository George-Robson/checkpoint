import { formatMonthLong } from '../../../lib/date';

/** YYYY-MM for a date-only ISO string or Date. */
export function periodOf(date: string | Date): string {
  return (typeof date === 'string' ? date : date.toISOString()).slice(0, 7);
}

export function periodStart(period: string): string {
  return `${period}-01`;
}

/** Last day of the month (YYYY-MM-DD). */
export function periodEnd(period: string): string {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

export function shiftPeriod(period: string, months: number): string {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1)).toISOString().slice(0, 7);
}

/** Every period from `from` to `to`, inclusive. */
export function periodsBetween(from: string, to: string): string[] {
  const periods: string[] = [];
  for (let period = from; period <= to; period = shiftPeriod(period, 1)) periods.push(period);
  return periods;
}

/** e.g. "September 2026" */
export function formatPeriod(period: string): string {
  return formatMonthLong(new Date(`${periodStart(period)}T00:00:00Z`));
}
