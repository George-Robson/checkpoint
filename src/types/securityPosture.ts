export type CyberEssentialsLevel = 'cyber-essentials' | 'cyber-essentials-plus';

export type DmarcPolicy = 'none' | 'quarantine' | 'reject';

/** A client's account-level security, from Microsoft 365 / Entra ID and Checkpoint's own records. */
export interface SecurityPosture {
  tenantId: string;
  /** Users registered for multi-factor authentication, out of all licensed users. */
  mfaEnrolled: number;
  mfaTotal: number;
  /** Users still without MFA, so they can be chased. */
  usersWithoutMfa: string[];
  /** Microsoft Secure Score, as a percentage of the achievable score (null on Google Workspace). */
  secureScore: number | null;
  cyberEssentials: { level: CyberEssentialsLevel; expiresOn: string } | null;
  dmarc: DmarcPolicy;
  /** Share of staff who clicked the last simulated phishing email, 0–1. */
  phishingClickRate: number | null;
  /** Game studios only: the controls publishers and platform holders check in security audits. */
  studio?: StudioSecurity;
}

export type PublisherAuditResult = 'passed' | 'passed-with-actions' | 'failed';

export interface StudioSecurity {
  /** Console devkits on their own network segment, away from office devices and guests. */
  devkitNetworkIsolated: boolean;
  /** Last review of who can reach builds and depots (contractors especially). */
  buildAccessReviewedOn: string | null;
  /** External builds carry a per-recipient watermark so leaks can be traced. */
  buildWatermarking: boolean;
  lastPublisherAudit: { on: string; result: PublisherAuditResult } | null;
  nextPublisherAudit: string | null;
}
