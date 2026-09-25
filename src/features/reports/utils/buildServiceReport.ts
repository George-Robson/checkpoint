import { backupJobs, securityPostures } from '../../../data/serviceData';
import { formatCurrency } from '../../../lib/currency';
import { addDays, daysBetween, formatDate, parseDate, toIsoDate } from '../../../lib/date';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import type { Device } from '../../../types/device';
import type { Invoice } from '../../../types/invoice';
import type { LicenceAssignment, LicencePool } from '../../../types/licence';
import type { OffboardingRequest } from '../../../types/offboarding';
import type { Onboarding } from '../../../types/onboarding';
import type { Tenant } from '../../../types/tenant';
import type { Ticket } from '../../../types/ticket';
import { INVOICE_STATUS_META } from '../../billing/constants/invoiceStatusMeta';
import { periodEnd, periodStart } from '../../billing/utils/billingPeriod';
import { invoiceStatus } from '../../billing/utils/invoiceStatus';
import { invoiceTotals } from '../../billing/utils/invoiceTotals';
import { backupDays, backupSuccessRate } from '../../health/utils/backupHistory';
import { assessHealth, getDeviceHealth, patchCompliance } from '../../health/utils/deviceHealth';
import { studioChecks } from '../../health/utils/studioChecks';
import { TICKET_CATEGORY_ORDER, TICKET_PRIORITY_META, TICKET_STATUS_META } from '../../helpdesk/constants/ticketMeta';
import { ticketSla } from '../../helpdesk/utils/ticketSla';
import { getSoftwareProduct } from '../../licences/utils/softwareLookup';
import type { ServiceReport } from '../types/serviceReport';

export interface ReportSources {
  tickets: Ticket[];
  devices: Device[];
  onboardings: Onboarding[];
  offboardings: OffboardingRequest[];
  pools: LicencePool[];
  assignments: LicenceAssignment[];
  invoices: Invoice[];
}

/** Certificates renewing this soon are called out. */
const RENEWAL_NOTICE_DAYS = 90;
const MAX_LISTED = 5;

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** Builds one client's report for one month from the live data. */
export function buildServiceReport(tenant: Tenant, period: string, today: string, sources: ReportSources): ServiceReport {
  const start = periodStart(period);
  const end = periodEnd(period);
  const partial = end >= today;
  const asOf = partial ? today : end;
  const asOfDate = new Date(`${asOf}T23:59:59Z`);
  const inPeriod = (iso: string | null) => iso !== null && iso.slice(0, 10) >= start && iso.slice(0, 10) <= end;

  // --- Support -----------------------------------------------------------------
  const tickets = sources.tickets.filter((ticket) => ticket.tenantId === tenant.id);
  const raised = tickets.filter((ticket) => inPeriod(ticket.createdAt));
  const resolved = tickets.filter((ticket) => inPeriod(ticket.resolvedAt));
  const slaResults = resolved.map((ticket) => ticketSla(ticket, tenant, asOfDate));
  const met = slaResults.filter((sla) => sla.response.status === 'met' && sla.resolution.status === 'met').length;
  const responses = raised
    .filter((ticket) => ticket.firstResponseAt)
    .map((ticket) => (new Date(ticket.firstResponseAt ?? '').getTime() - new Date(ticket.createdAt).getTime()) / 60_000);
  const openAtEnd = tickets.filter(
    (ticket) => ticket.createdAt.slice(0, 10) <= asOf && (!ticket.resolvedAt || ticket.resolvedAt.slice(0, 10) > asOf),
  ).length;

  // --- Health (a snapshot: the monitoring tool only reports current state) ----------
  const devices = sources.devices.filter((device) => device.tenantId === tenant.id);
  const snapshotDate = new Date(`${today}T23:59:59Z`);
  const entries = devices.map((device) => {
    const health = getDeviceHealth(device);
    return { device, health, assessment: assessHealth(device, health, snapshotDate) };
  });
  const monitored = entries.filter((entry) => entry.assessment.level !== 'unmonitored');
  const agents = monitored.filter((entry) => entry.health.edr !== 'not-applicable');
  const needingAttention = monitored
    .filter((entry) => entry.assessment.level === 'critical' || entry.assessment.level === 'warning')
    .map((entry) => ({ name: entry.device.name, reasons: entry.assessment.reasons }));

  // --- Backups ---------------------------------------------------------------------
  const jobs = backupJobs.filter((job) => job.tenantId === tenant.id);
  const days = jobs.flatMap((job) => backupDays(job, start, end, today));
  const backupIssues = jobs
    .filter((job) => job.recent.status !== 'success' && job.recent.message)
    .map((job) => ({ name: job.name, message: job.recent.message ?? '' }));

  // --- Fleet and people --------------------------------------------------------------
  const refreshBy = toIsoDate(addDays(parseDate(asOf), REFRESH_WINDOW_DAYS));
  const upcomingRefreshes = devices
    .filter((device) => device.termEndDate > asOf && device.termEndDate <= refreshBy)
    .sort((a, b) => a.termEndDate.localeCompare(b.termEndDate))
    .map((device) => ({
      name: device.name,
      model: device.model,
      user: device.assignedUser ?? device.location,
      endsOn: device.termEndDate,
      owned: device.acquisition === 'purchase',
    }));

  // --- Licences ----------------------------------------------------------------------
  const pools = sources.pools.filter((pool) => pool.tenantId === tenant.id);
  const used = (softwareId: string) =>
    sources.assignments.filter((assignment) => assignment.tenantId === tenant.id && assignment.softwareId === softwareId).length;
  const seats = pools.reduce((sum, pool) => sum + pool.seats, 0);
  const usedSeats = pools.reduce((sum, pool) => sum + Math.min(pool.seats, used(pool.softwareId)), 0);
  const idleCost = pools.reduce(
    (sum, pool) => sum + Math.max(0, pool.seats - used(pool.softwareId)) * (getSoftwareProduct(pool.softwareId)?.monthlyPricePerSeat ?? 0),
    0,
  );

  // --- Billing -----------------------------------------------------------------------
  const invoice = sources.invoices.find((candidate) => candidate.tenantId === tenant.id && candidate.period === period);
  const security = securityPostures.find((posture) => posture.tenantId === tenant.id) ?? null;
  const studio = security ? studioChecks(security, snapshotDate) : [];

  // --- Recommendations: what Checkpoint suggests doing next ----------------------------
  const recommendations: string[] = [];
  // Publisher-audit gaps come first for studios: an audit failure can stop a project.
  for (const check of studio) {
    if (!check.ok && check.label !== 'MFA for everyone' && check.label !== 'Cyber Essentials') recommendations.push(check.fix);
  }
  if (security && security.usersWithoutMfa.length > 0) {
    recommendations.push(`Enrol the ${plural(security.usersWithoutMfa.length, 'account')} without MFA: ${security.usersWithoutMfa.join(', ')}.`);
  }
  if (security && !security.cyberEssentials) {
    recommendations.push('Get Cyber Essentials certified: it’s often required for public-sector and insurance work, and we can prepare you.');
  } else if (security?.cyberEssentials && daysBetween(parseDate(asOf), parseDate(security.cyberEssentials.expiresOn)) <= RENEWAL_NOTICE_DAYS) {
    recommendations.push(`Renew Cyber Essentials before ${formatDate(security.cyberEssentials.expiresOn)}.`);
  }
  if (security && security.dmarc !== 'reject') {
    recommendations.push('Move email authentication (DMARC) to “reject” so spoofed emails from your domain are blocked.');
  }
  if (security && security.phishingClickRate === null) recommendations.push('Run a phishing simulation to benchmark staff awareness.');
  if (needingAttention.length > 0) {
    recommendations.push(`Resolve ${plural(needingAttention.length, 'device')} needing attention (${needingAttention.slice(0, 3).map((device) => device.name).join(', ')}${needingAttention.length > 3 ? '…' : ''}).`);
  }
  for (const issue of backupIssues) recommendations.push(`Backup for ${issue.name}: ${issue.message}`);
  if (upcomingRefreshes.length > 0) {
    recommendations.push(`Plan replacements for ${plural(upcomingRefreshes.length, 'device')} whose lease or warranty ends by ${formatDate(refreshBy)}.`);
  }
  if (idleCost > 0) {
    recommendations.push(`Reduce ${plural(seats - usedSeats, 'unused licence seat')} to save ${formatCurrency(idleCost)} a month.`);
  }

  return {
    tenant,
    period,
    asOf,
    snapshotOn: today,
    partial,
    support: {
      raised: raised.length,
      resolved: resolved.length,
      slaMet: slaResults.length ? met / slaResults.length : null,
      averageFirstResponseMinutes: responses.length ? Math.round(responses.reduce((sum, minutes) => sum + minutes, 0) / responses.length) : null,
      openAtEnd,
      byCategory: TICKET_CATEGORY_ORDER.map((category) => ({
        category,
        count: raised.filter((ticket) => ticket.category === category).length,
      })).filter((entry) => entry.count > 0),
      majorIncidents: raised
        .filter((ticket) => ticket.priority === 'p1' || ticket.priority === 'p2')
        .slice(0, MAX_LISTED)
        .map((ticket) => ({
          reference: ticket.reference,
          subject: ticket.subject,
          priority: TICKET_PRIORITY_META[ticket.priority].short,
          outcome: TICKET_STATUS_META[ticket.status].label,
        })),
    },
    health: {
      monitored: monitored.length,
      healthy: monitored.filter((entry) => entry.assessment.level === 'healthy').length,
      patchCompliance: patchCompliance(entries),
      protectedComputers: agents.filter((entry) => entry.health.edr === 'active' && entry.health.encryption === 'encrypted').length,
      agentComputers: agents.length,
      needingAttention: needingAttention.slice(0, MAX_LISTED),
    },
    backups: { jobs: jobs.length, successRate: backupSuccessRate(days), issues: backupIssues },
    security,
    studioChecks: studio.map(({ label, ok, detail }) => ({ label, ok, detail })),
    fleet: {
      devices: devices.filter((device) => device.termStartDate <= asOf).length,
      added: devices.filter((device) => inPeriod(device.termStartDate)).length,
      joiners: sources.onboardings.filter((onboarding) => onboarding.tenantId === tenant.id && inPeriod(onboarding.startDate)).map((onboarding) => onboarding.person),
      leavers: sources.offboardings.filter((request) => request.tenantId === tenant.id && inPeriod(request.lastWorkingDay)).map((request) => request.employee),
      upcomingRefreshes: upcomingRefreshes.slice(0, MAX_LISTED),
    },
    licences: { seats, used: usedSeats, idleSeats: seats - usedSeats, idleCost },
    billing: invoice
      ? { invoiceNumber: invoice.number, total: invoiceTotals(invoice).total, status: INVOICE_STATUS_META[invoiceStatus(invoice, today)].label }
      : null,
    recommendations,
  };
}
