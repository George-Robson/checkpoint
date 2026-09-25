import type { TenantPlan } from '../../../types/tenant';
import type { TicketPriority } from '../../../types/ticket';

export interface SlaTarget {
  /** Time to Checkpoint's first response. */
  responseMinutes: number;
  /** Time to resolution. */
  resolutionMinutes: number;
}

const HOUR = 60;

/**
 * Service levels by plan and priority, measured on a 24-hour clock in this mockup. In production the PSA
 * measures them against each client's contracted support hours and pauses them while waiting on the client.
 */
export const SLA_TARGETS: Record<TenantPlan, Record<TicketPriority, SlaTarget>> = {
  Enterprise: {
    p1: { responseMinutes: 15, resolutionMinutes: 4 * HOUR },
    p2: { responseMinutes: 1 * HOUR, resolutionMinutes: 8 * HOUR },
    p3: { responseMinutes: 4 * HOUR, resolutionMinutes: 24 * HOUR },
    p4: { responseMinutes: 8 * HOUR, resolutionMinutes: 72 * HOUR },
  },
  Professional: {
    p1: { responseMinutes: 30, resolutionMinutes: 4 * HOUR },
    p2: { responseMinutes: 2 * HOUR, resolutionMinutes: 12 * HOUR },
    p3: { responseMinutes: 8 * HOUR, resolutionMinutes: 48 * HOUR },
    p4: { responseMinutes: 24 * HOUR, resolutionMinutes: 120 * HOUR },
  },
  Essentials: {
    p1: { responseMinutes: 1 * HOUR, resolutionMinutes: 8 * HOUR },
    p2: { responseMinutes: 4 * HOUR, resolutionMinutes: 24 * HOUR },
    p3: { responseMinutes: 8 * HOUR, resolutionMinutes: 72 * HOUR },
    p4: { responseMinutes: 24 * HOUR, resolutionMinutes: 120 * HOUR },
  },
};

/** An SLA is "at risk" once this share of its time has gone. */
export const AT_RISK_SHARE = 0.75;
