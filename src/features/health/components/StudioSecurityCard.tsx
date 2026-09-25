import { CircleCheck, CircleX } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { Tone } from '../../../components/ui/tone';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { cn } from '../../../lib/cn';
import { daysBetween, formatDate, getNow, parseDate } from '../../../lib/date';
import type { PublisherAuditResult, SecurityPosture } from '../../../types/securityPosture';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { studioChecks } from '../utils/studioChecks';

const AUDIT_RESULT: Record<PublisherAuditResult, { label: string; tone: Tone }> = {
  passed: { label: 'Passed', tone: 'emerald' },
  'passed-with-actions': { label: 'Passed with actions', tone: 'amber' },
  failed: { label: 'Failed', tone: 'rose' },
};

interface StudioSecurityCardProps {
  postures: SecurityPosture[];
}

/** For game studios: the controls publishers and platform holders check before trusting a studio with builds. */
export function StudioSecurityCard({ postures }: StudioSecurityCardProps) {
  const studios = postures.filter((posture) => posture.studio);
  if (studios.length === 0) return null;
  const now = getNow();

  return (
    <Card>
      <CardHeader
        title="Publisher security readiness"
        description="Game studios are audited by publishers and platform holders before they're trusted with builds, devkits and pre-release assets."
      />
      <div className={cn('grid gap-px bg-slate-100', studios.length > 1 && 'sm:grid-cols-2')}>
        {studios.map((posture) => {
          const studio = posture.studio;
          if (!studio) return null;
          const checks = studioChecks(posture, now);
          const passed = checks.filter((check) => check.ok).length;
          const daysToAudit = studio.nextPublisherAudit ? daysBetween(now, parseDate(studio.nextPublisherAudit)) : null;
          return (
            <section key={posture.tenantId} className="space-y-3 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">{getTenantName(posture.tenantId)}</h3>
                  <p className="text-xs text-slate-500">
                    {passed} of {checks.length} controls in place
                    {studio.nextPublisherAudit && ` · next audit ${formatDate(studio.nextPublisherAudit)}`}
                    {daysToAudit !== null && daysToAudit >= 0 && ` (${daysToAudit} days)`}
                  </p>
                </div>
                {studio.lastPublisherAudit ? (
                  <Badge tone={AUDIT_RESULT[studio.lastPublisherAudit.result].tone}>
                    {AUDIT_RESULT[studio.lastPublisherAudit.result].label} · {formatDate(studio.lastPublisherAudit.on)}
                  </Badge>
                ) : (
                  <Badge tone="slate">First audit pending</Badge>
                )}
              </div>
              <ul className="space-y-2">
                {checks.map((check) => (
                  <li key={check.label} className="flex gap-2 text-sm">
                    {check.ok ? (
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <CircleX aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rose-600" />
                    )}
                    <span className="min-w-0">
                      <span className={cn(check.ok ? 'text-slate-900' : 'font-medium text-slate-900')}>{check.label}</span>
                      <span className="block text-xs text-slate-500">{check.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
