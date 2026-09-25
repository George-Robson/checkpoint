export type BackupKind = 'microsoft-365' | 'google-workspace' | 'server' | 'cloud-server';

export type BackupRunStatus = 'success' | 'warning' | 'failed';

/** A scheduled backup job, as reported by the backup platform. */
export interface BackupJob {
  id: string;
  tenantId: string;
  name: string;
  kind: BackupKind;
  /** What it covers, e.g. "42 mailboxes · OneDrive · SharePoint". */
  scope: string;
  /** The server or instance backed up, for server jobs. */
  deviceId: string | null;
  schedule: string;
  retentionDays: number;
  protectedGb: number;
  /** Consecutive recent runs with this status (the latest runs), so a job can be "failing for 3 days". */
  recent: { status: BackupRunStatus; runs: number; message: string | null };
}
