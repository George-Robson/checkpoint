import { useState } from 'react';
import { BellRing, CircleCheck, DatabaseBackup, HeartPulse, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { FilterSelect, type FilterSelectOption } from '../../components/ui/FilterSelect';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { alerts } from '../../data/mockData';
import { backupJobs, securityPostures } from '../../data/serviceData';
import { getNow, toIsoDate } from '../../lib/date';
import type { Alert } from '../../types/alert';
import type { HealthLevel } from '../../types/deviceHealth';
import { useTickets } from '../helpdesk/hooks/useTickets';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { BackupJobsTable } from './components/BackupJobsTable';
import { DeviceHealthTable } from './components/DeviceHealthTable';
import { HealthSummary } from './components/HealthSummary';
import { MonitoringAlertsList } from './components/MonitoringAlertsList';
import { SecurityPostureTable } from './components/SecurityPostureTable';
import { StudioSecurityCard } from './components/StudioSecurityCard';
import { HEALTH_LEVEL_META, HEALTH_LEVEL_ORDER } from './constants/healthMeta';
import { useFleetHealth } from './hooks/useFleetHealth';

type HealthTab = 'devices' | 'security' | 'backups' | 'alerts';
const TABS: HealthTab[] = ['devices', 'security', 'backups', 'alerts'];
const TAB_PANEL_ID = 'health-tab-panel';

const LEVEL_OPTIONS: FilterSelectOption<HealthLevel | 'all'>[] = [
  { value: 'all', label: 'All devices' },
  ...HEALTH_LEVEL_ORDER.map((level) => ({ value: level, label: HEALTH_LEVEL_META[level].label })),
];

export function HealthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedTenant, isGlobalView } = useTenant();
  const entries = useFleetHealth();
  const backups = useTenantScoped(backupJobs);
  const postures = useTenantScoped(securityPostures);
  const scopedAlerts = useTenantScoped(alerts);
  const { tickets, raiseTicket } = useTickets();
  const [level, setLevel] = useState<HealthLevel | 'all'>('all');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const requested = searchParams.get('tab') as HealthTab | null;
  const tab: HealthTab = requested && TABS.includes(requested) ? requested : 'devices';
  const today = toIsoDate(getNow());
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntries = entries.filter(
    (entry) =>
      (level === 'all' || entry.assessment.level === level) &&
      (!normalizedQuery || `${entry.device.name} ${entry.device.model} ${entry.device.assignedUser ?? ''}`.toLowerCase().includes(normalizedQuery)),
  );
  const attention = entries.filter((entry) => entry.assessment.level === 'critical' || entry.assessment.level === 'warning').length;

  const tabItems: TabItem<HealthTab>[] = [
    { value: 'devices', label: 'Devices & patching', icon: HeartPulse, count: attention },
    { value: 'security', label: 'Security', icon: ShieldCheck },
    { value: 'backups', label: 'Backups', icon: DatabaseBackup, count: backups.filter((job) => job.recent.status !== 'success').length },
    { value: 'alerts', label: 'Alerts', icon: BellRing, count: scopedAlerts.length },
  ];

  function raiseFromAlert(alert: Alert) {
    const ticket = raiseTicket({
      tenantId: alert.tenantId,
      subject: alert.title,
      description: `Raised from a monitoring alert: ${alert.description}`,
      requester: 'Monitoring',
      category: alert.title.toLowerCase().includes('switch') || alert.title.toLowerCase().includes('access point') ? 'network' : 'hardware',
      priority: alert.severity === 'critical' ? 'p1' : alert.severity === 'warning' ? 'p3' : 'p4',
      source: 'monitoring',
      deviceId: alert.deviceId,
      alertId: alert.id,
    });
    setNotice(`Raised ${ticket.reference} from the “${alert.title}” alert.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health & security"
        description={`Device health, patching, protection and backups${selectedTenant ? ` for ${selectedTenant.name}` : ' across clients'}. Reported by the monitoring tool, Intune and the backup platform.`}
      />

      {notice && (
        <div role="status" className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          {notice}
        </div>
      )}

      <HealthSummary entries={entries} backups={backups} alerts={scopedAlerts} />

      <Tabs
        items={tabItems}
        value={tab}
        onChange={(next) => setSearchParams(next === 'devices' ? {} : { tab: next }, { replace: true })}
        ariaLabel="Health views"
        controls={TAB_PANEL_ID}
      />

      <Card id={TAB_PANEL_ID} role="tabpanel" className="overflow-hidden">
        {tab === 'devices' && (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search devices or users…"
                aria-label="Search devices"
                className="w-full sm:w-64"
              />
              <FilterSelect label="Filter by health" value={level} options={LEVEL_OPTIONS} onChange={setLevel} active={level !== 'all'} />
              <p aria-live="polite" className="ml-auto text-sm tabular-nums text-slate-500">
                {visibleEntries.length} {visibleEntries.length === 1 ? 'device' : 'devices'}
              </p>
            </div>
            <DeviceHealthTable entries={visibleEntries} showTenant={isGlobalView} />
          </>
        )}
        {tab === 'security' && <SecurityPostureTable postures={postures} entries={entries} />}
        {tab === 'backups' && <BackupJobsTable jobs={backups} today={today} showTenant={isGlobalView} />}
        {tab === 'alerts' && (
          <MonitoringAlertsList alerts={scopedAlerts} tickets={tickets} showTenant={isGlobalView} onRaiseTicket={raiseFromAlert} />
        )}
      </Card>

      {tab === 'security' && <StudioSecurityCard postures={postures} />}
    </div>
  );
}
