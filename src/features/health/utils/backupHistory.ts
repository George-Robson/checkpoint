import { addDays, parseDate, toIsoDate } from '../../../lib/date';
import { stableUnit } from '../../../lib/hash';
import type { BackupJob, BackupRunStatus } from '../../../types/backup';

export interface BackupDay {
  date: string;
  status: BackupRunStatus;
}

/**
 * The outcome of a job's runs on one day, as the backup platform would report it. The latest days follow the
 * job's recent status (e.g. "failing for 3 days"); earlier days are almost always successful.
 */
export function backupStatusOn(job: BackupJob, date: string, today: string): BackupRunStatus {
  const recentFrom = toIsoDate(addDays(parseDate(today), -(job.recent.runs - 1)));
  if (date >= recentFrom) return job.recent.status;
  const roll = stableUnit(`${job.id}-${date}`);
  if (roll < 0.015) return 'failed';
  if (roll < 0.04) return 'warning';
  return 'success';
}

/** Daily outcomes from `from` to `to` inclusive (capped at today). */
export function backupDays(job: BackupJob, from: string, to: string, today: string): BackupDay[] {
  const end = to < today ? to : today;
  const days: BackupDay[] = [];
  for (let date = parseDate(from); toIsoDate(date) <= end; date = addDays(date, 1)) {
    days.push({ date: toIsoDate(date), status: backupStatusOn(job, toIsoDate(date), today) });
  }
  return days;
}

/** Share of days whose backups fully succeeded (warnings count as partial, so not successes). */
export function backupSuccessRate(days: BackupDay[]): number | null {
  if (days.length === 0) return null;
  return days.filter((day) => day.status === 'success').length / days.length;
}
