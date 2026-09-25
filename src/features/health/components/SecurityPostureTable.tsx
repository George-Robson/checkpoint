import { Badge } from '../../../components/ui/Badge';
import { Meter } from '../../../components/ui/Meter';
import { cn } from '../../../lib/cn';
import { daysBetween, formatDate, getNow, parseDate } from '../../../lib/date';
import type { SecurityPosture } from '../../../types/securityPosture';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { CYBER_ESSENTIALS_LABEL, DMARC_META } from '../constants/healthMeta';
import type { DeviceHealthEntry } from '../hooks/useFleetHealth';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

/** Certificates renewing within this many days are flagged. */
const RENEWAL_WARNING_DAYS = 60;

interface SecurityPostureTableProps {
  postures: SecurityPosture[];
  entries: DeviceHealthEntry[];
}

/** Account-level security per client: identity, certification, email and device protection. */
export function SecurityPostureTable({ postures, entries }: SecurityPostureTableProps) {
  const now = getNow();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {['Client', 'MFA coverage', 'Secure Score', 'Devices protected', 'Cyber Essentials', 'Email (DMARC)', 'Phishing test'].map(
              (heading) => (
                <th key={heading} scope="col" className={HEADER_CELL}>
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {postures.map((posture) => {
            const agents = entries.filter(
              (entry) =>
                entry.device.tenantId === posture.tenantId &&
                entry.health.edr !== 'not-applicable' &&
                entry.assessment.level !== 'unmonitored',
            );
            const protectedCount = agents.filter((entry) => entry.health.edr === 'active' && entry.health.encryption === 'encrypted').length;
            const mfaShare = posture.mfaEnrolled / posture.mfaTotal;
            const certificate = posture.cyberEssentials;
            const renewsIn = certificate ? daysBetween(now, parseDate(certificate.expiresOn)) : null;
            const dmarc = DMARC_META[posture.dmarc];
            return (
              <tr key={posture.tenantId} className="hover:bg-slate-50">
                <td className={cn(CELL, 'whitespace-nowrap font-medium text-slate-900')}>{getTenantName(posture.tenantId)}</td>
                <td className={cn(CELL, 'min-w-44')}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className={cn('tabular-nums', mfaShare < 0.95 ? 'text-amber-700' : 'text-slate-700')}>
                      {Math.round(mfaShare * 100)}%
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {posture.mfaEnrolled} / {posture.mfaTotal}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Meter value={posture.mfaEnrolled} max={posture.mfaTotal} label={`MFA coverage for ${getTenantName(posture.tenantId)}`} />
                  </div>
                  {posture.usersWithoutMfa.length > 0 && (
                    <p className="mt-1 max-w-56 truncate text-xs text-slate-500" title={posture.usersWithoutMfa.join(', ')}>
                      Missing: {posture.usersWithoutMfa.join(', ')}
                    </p>
                  )}
                </td>
                <td
                  className={cn(
                    CELL,
                    'whitespace-nowrap tabular-nums',
                    posture.secureScore !== null && posture.secureScore < 60 ? 'text-amber-700' : 'text-slate-700',
                  )}
                >
                  {posture.secureScore === null ? <span className="text-slate-400">Google Workspace</span> : `${posture.secureScore}%`}
                </td>
                <td className={cn(CELL, 'whitespace-nowrap tabular-nums', protectedCount < agents.length ? 'text-amber-700' : 'text-slate-700')}>
                  {protectedCount} / {agents.length}
                </td>
                <td className={CELL}>
                  {certificate ? (
                    <>
                      <p className="whitespace-nowrap text-slate-700">{CYBER_ESSENTIALS_LABEL[certificate.level]}</p>
                      <p className={cn('whitespace-nowrap text-xs', renewsIn !== null && renewsIn <= RENEWAL_WARNING_DAYS ? 'text-amber-700' : 'text-slate-500')}>
                        Renew by {formatDate(certificate.expiresOn)}
                      </p>
                    </>
                  ) : (
                    <Badge tone="rose">Not certified</Badge>
                  )}
                </td>
                <td className={CELL}>
                  <Badge tone={dmarc.tone}>{dmarc.label}</Badge>
                </td>
                <td className={cn(CELL, 'whitespace-nowrap tabular-nums text-slate-700')}>
                  {posture.phishingClickRate === null ? (
                    <span className="text-slate-400">Not run</span>
                  ) : (
                    `${Math.round(posture.phishingClickRate * 100)}% clicked`
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
