import type { ReactNode } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { Meter } from '../../../components/ui/Meter';
import { formatCurrency, formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { CYBER_ESSENTIALS_LABEL, DMARC_META } from '../../health/constants/healthMeta';
import { TICKET_CATEGORY_META } from '../../helpdesk/constants/ticketMeta';
import type { ServiceReport } from '../types/serviceReport';
import { formatResponse, formatShare } from '../utils/reportFormat';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  );
}

/** A client's monthly service report, as shown on screen (the PDF carries the same content). */
export function ServiceReportView({ report }: { report: ServiceReport }) {
  const { tenant, support, health, backups, security, fleet, licences, billing } = report;
  const maxCategory = Math.max(1, ...support.byCategory.map((entry) => entry.count));

  const kpis = [
    { label: 'Tickets resolved', value: `${support.resolved}`, detail: `${support.raised} raised · ${support.openAtEnd} open at month end` },
    { label: 'Resolved within SLA', value: formatShare(support.slaMet), detail: `${tenant.plan} plan targets` },
    { label: 'Average first response', value: formatResponse(support.averageFirstResponseMinutes), detail: 'Across tickets raised' },
    { label: 'Healthy devices', value: `${health.healthy} / ${health.monitored}`, detail: `Current, as at ${formatDate(report.snapshotOn)}` },
    { label: 'Patch compliance', value: formatShare(health.patchCompliance), detail: 'Devices fully up to date' },
    { label: 'Backup success', value: formatShare(backups.successRate), detail: `${backups.jobs} backup jobs, daily` },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-6 xl:divide-x">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="px-4 py-4">
              <dt className="text-sm text-slate-500">{kpi.label}</dt>
              <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-900">{kpi.value}</dd>
              <dd className="mt-0.5 text-xs text-slate-500">{kpi.detail}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Support" description="Tickets raised this month, by category." />
          <div className="space-y-3 p-4">
            {support.byCategory.length === 0 && <p className="text-sm text-slate-500">No tickets this month.</p>}
            {support.byCategory.map((entry) => {
              const { label, icon: Icon } = TICKET_CATEGORY_META[entry.category];
              return (
                <div key={entry.category}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <Icon aria-hidden="true" className="size-4 text-slate-400" />
                      {label}
                    </span>
                    <span className="tabular-nums text-slate-900">{entry.count}</span>
                  </div>
                  <div className="mt-1.5">
                    <Meter value={entry.count} max={maxCategory} label={`${label} tickets`} />
                  </div>
                </div>
              );
            })}
            {support.majorIncidents.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-medium text-slate-500">High-priority tickets</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {support.majorIncidents.map((incident) => (
                    <li key={incident.reference} className="flex items-start justify-between gap-3">
                      <span className="min-w-0 text-slate-900">
                        <span className="text-slate-500">{incident.priority} · </span>
                        {incident.subject}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">{incident.outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Security" description="Identity, certification, email and device protection." />
          <dl className="divide-y divide-slate-100 px-4 py-2">
            {security && (
              <>
                <Row label="MFA coverage">
                  {security.mfaEnrolled} / {security.mfaTotal} users
                </Row>
                {security.secureScore !== null && <Row label="Microsoft Secure Score">{security.secureScore}%</Row>}
                <Row label="Cyber Essentials">
                  {security.cyberEssentials ? (
                    `${CYBER_ESSENTIALS_LABEL[security.cyberEssentials.level]} · renew by ${formatDate(security.cyberEssentials.expiresOn)}`
                  ) : (
                    <Badge tone="rose">Not certified</Badge>
                  )}
                </Row>
                <Row label="Email protection (DMARC)">
                  <Badge tone={DMARC_META[security.dmarc].tone}>{DMARC_META[security.dmarc].label}</Badge>
                </Row>
              </>
            )}
            <Row label="Computers protected (EDR + encryption)">
              {health.protectedComputers} / {health.agentComputers}
            </Row>
          </dl>
          {report.studioChecks.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Publisher security readiness</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {report.studioChecks.map((check) => (
                  <li key={check.label} className="flex justify-between gap-3">
                    <span className="text-slate-900">{check.label}</span>
                    <Badge tone={check.ok ? 'emerald' : 'rose'}>{check.ok ? 'In place' : 'Gap'}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Devices & people" description="The fleet, joiners and leavers, and what's due for refresh." />
          <dl className="divide-y divide-slate-100 px-4 py-2">
            <Row label="Devices under management">{fleet.devices}</Row>
            <Row label="Added this month">{fleet.added}</Row>
            <Row label="Joiners">{fleet.joiners.join(', ') || 'None'}</Row>
            <Row label="Leavers">{fleet.leavers.join(', ') || 'None'}</Row>
          </dl>
          {fleet.upcomingRefreshes.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Due for refresh</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {fleet.upcomingRefreshes.map((device) => (
                  <li key={device.name} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate text-slate-900">
                      {device.name} <span className="text-slate-500">· {device.user}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {device.owned ? 'Warranty' : 'Lease'} ends {formatDate(device.endsOn)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Licences & billing" />
          <dl className="divide-y divide-slate-100 px-4 py-2">
            <Row label="Seats in use">
              {licences.used} / {licences.seats}
            </Row>
            <Row label="Unused seats">
              {licences.idleSeats} · {formatCurrency(licences.idleCost)}/mo
            </Row>
            {billing && (
              <Row label={`Invoice ${billing.invoiceNumber}`}>
                {formatMoney(billing.total)} · {billing.status}
              </Row>
            )}
          </dl>
          {(health.needingAttention.length > 0 || backups.issues.length > 0) && (
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Needs attention now</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {health.needingAttention.map((device) => (
                  <li key={device.name} className="text-slate-900">
                    {device.name} <span className="text-slate-500">· {device.reasons.join(', ')}</span>
                  </li>
                ))}
                {backups.issues.map((issue) => (
                  <li key={issue.name} className="text-slate-900">
                    Backup {issue.name} <span className="text-slate-500">· {issue.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Our recommendations" description="What Checkpoint suggests doing next, most important first." />
        {report.recommendations.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-500">Nothing outstanding this month.</p>
        ) : (
          <ol className="space-y-3 px-4 py-4">
            {report.recommendations.map((recommendation, index) => (
              <li key={recommendation} className="flex gap-3 text-sm text-slate-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-medium tabular-nums text-slate-500">
                  {index + 1}
                </span>
                <span className="pt-0.5">{recommendation}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
