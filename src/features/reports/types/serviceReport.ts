import type { TicketCategory } from '../../../types/ticket';
import type { SecurityPosture } from '../../../types/securityPosture';
import type { Tenant } from '../../../types/tenant';

/** Everything in a client's monthly service report, shared by the on-screen view and the PDF. */
export interface ServiceReport {
  tenant: Tenant;
  period: string;
  /** Month-based figures (tickets, backups, people) run to this date: the end of the month, or today if earlier. */
  asOf: string;
  /** Health, security and "needs attention" come from the monitoring tools' current state, as at this date. */
  snapshotOn: string;
  /** The month isn't over yet. */
  partial: boolean;
  support: {
    raised: number;
    resolved: number;
    /** Share of resolved tickets that met both response and resolution targets. */
    slaMet: number | null;
    averageFirstResponseMinutes: number | null;
    openAtEnd: number;
    byCategory: { category: TicketCategory; count: number }[];
    /** P1 and P2 tickets raised in the month. */
    majorIncidents: { reference: string; subject: string; priority: string; outcome: string }[];
  };
  health: {
    monitored: number;
    healthy: number;
    patchCompliance: number | null;
    protectedComputers: number;
    agentComputers: number;
    needingAttention: { name: string; reasons: string[] }[];
  };
  backups: {
    jobs: number;
    successRate: number | null;
    issues: { name: string; message: string }[];
  };
  security: SecurityPosture | null;
  /** Game studios only: publisher-audit controls. */
  studioChecks: { label: string; ok: boolean; detail: string }[];
  fleet: {
    devices: number;
    added: number;
    joiners: string[];
    leavers: string[];
    upcomingRefreshes: { name: string; model: string; user: string; endsOn: string; owned: boolean }[];
  };
  licences: { seats: number; used: number; idleSeats: number; idleCost: number };
  billing: { invoiceNumber: string; total: number; status: string } | null;
  recommendations: string[];
}
