import { MOCK_NOW } from '../data/mockData';

const DAY_MS = 86_400_000;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
});

const longMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Days the demo clock has been moved forward from MOCK_NOW (see the top-bar demo clock). */
let clockOffsetDays = 0;

/** The app's clock: the mock dataset's "now", plus however far the demo clock has been advanced. */
export function getNow(): Date {
  return new Date(new Date(MOCK_NOW).getTime() + clockOffsetDays * DAY_MS);
}

/** Only the ClockProvider should call this, so the app re-renders against the new date. */
export function setClockOffsetDays(days: number): void {
  clockOffsetDays = days;
}

/** Parses a date-only ISO string (YYYY-MM-DD) as UTC midnight. */
export function parseDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

/** Whole days from `from` until `to`, rounded up (partial days count as a day). */
export function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / DAY_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Date-only ISO string (YYYY-MM-DD) in UTC. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(iso.length === 10 ? parseDate(iso) : new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${dateTimeFormatter.format(new Date(iso))} UTC`;
}

/** e.g. "Oct 26" */
export function formatMonth(date: Date): string {
  return monthFormatter.format(date);
}

/** e.g. "October 2026" */
export function formatMonthLong(date: Date): string {
  return longMonthFormatter.format(date);
}

/** Calendar distance to a date-only ISO string: "today", "tomorrow", "in 4 days", "3 days ago". */
export function formatRelativeDay(isoDate: string, now: Date = getNow()): string {
  const days = daysBetween(parseDate(toIsoDate(now)), parseDate(isoDate));
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

/** e.g. "12m ago", "4h ago", "3d ago" */
export function formatRelativeTime(iso: string, now: Date = getNow()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
