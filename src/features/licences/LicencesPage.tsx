import { useState } from 'react';
import { CircleCheck, KeyRound, Layers, Plus, ShieldCheck, Tags, UserPlus, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { paths } from '../../app/paths';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { softwareProducts } from '../../data/mockData';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { BaselineEditor } from './components/BaselineEditor';
import { BundleDrawer } from './components/BundleDrawer';
import { BundlesTable } from './components/BundlesTable';
import { LicenceSummary } from './components/LicenceSummary';
import { PeopleTable } from './components/PeopleTable';
import { PersonLicencesDrawer } from './components/PersonLicencesDrawer';
import { PoolDrawer } from './components/PoolDrawer';
import { PoolsTable } from './components/PoolsTable';
import { SoftwareCatalogTable } from './components/SoftwareCatalogTable';
import { useLicences } from './hooks/useLicences';
import { useLicensedPeople } from './hooks/useLicensedPeople';
import { usePoolRows } from './hooks/usePoolRows';

type LicencesTab = 'pools' | 'people' | 'bundles' | 'baseline' | 'catalogue';
const TABS: LicencesTab[] = ['pools', 'people', 'bundles', 'baseline', 'catalogue'];
const TAB_PANEL_ID = 'licences-tab-panel';

/** Which drawer is open: a pool, a person (or "choose a person"), or a bundle (new when no id). */
type OpenDrawer =
  | { kind: 'pool'; poolId: string }
  | { kind: 'person'; personKey?: string }
  | { kind: 'bundle'; bundleId?: string }
  | null;

export function LicencesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedTenant, isGlobalView } = useTenant();
  const rows = usePoolRows();
  const people = useLicensedPeople();
  const { bundles } = useLicences();
  const scopedBundles = useTenantScoped(bundles);
  const [drawer, setDrawer] = useState<OpenDrawer>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requested = searchParams.get('tab') as LicencesTab | null;
  const tab: LicencesTab = requested && TABS.includes(requested) ? requested : 'pools';
  const openPool = drawer?.kind === 'pool' ? rows.find((row) => row.pool.id === drawer.poolId) : undefined;
  const openBundle = drawer?.kind === 'bundle' && drawer.bundleId ? bundles.find((b) => b.id === drawer.bundleId) : undefined;

  const tabItems: TabItem<LicencesTab>[] = [
    { value: 'pools', label: 'Seat pools', icon: KeyRound, count: rows.length },
    { value: 'people', label: 'People', icon: Users, count: people.length },
    { value: 'bundles', label: 'Bundles', icon: Layers, count: scopedBundles.length },
    { value: 'baseline', label: 'Client baseline', icon: ShieldCheck },
    { value: 'catalogue', label: 'Software catalogue', icon: Tags, count: softwareProducts.length },
  ];

  function handleChanged(message: string) {
    setNotice(message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Software & licences"
        description={`Seats${selectedTenant ? ` for ${selectedTenant.name}` : ' across clients'}, who holds them, and what they cost. Licences are assigned per person, separately from hardware.`}
        actions={
          <>
            <Link to={paths.newOnboarding} className={buttonClasses('secondary', 'md')}>
              <UserPlus aria-hidden="true" className="size-4" />
              Onboard a new hire
            </Link>
            <Button onClick={() => setDrawer({ kind: 'person' })}>
              <KeyRound aria-hidden="true" className="size-4" />
              Assign licences
            </Button>
          </>
        }
      />

      {notice && (
        <div role="status" className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          {notice}
        </div>
      )}

      <LicenceSummary rows={rows} people={people} />

      <Tabs
        items={tabItems}
        value={tab}
        onChange={(next) => setSearchParams(next === 'pools' ? {} : { tab: next }, { replace: true })}
        ariaLabel="Licence views"
        controls={TAB_PANEL_ID}
      />

      <Card id={TAB_PANEL_ID} role="tabpanel" className="overflow-hidden">
        {tab === 'pools' && (
          <PoolsTable rows={rows} showTenant={isGlobalView} onManage={(poolId) => setDrawer({ kind: 'pool', poolId })} />
        )}
        {tab === 'people' && (
          <PeopleTable
            people={people}
            showTenant={isGlobalView}
            onManage={(personKey) => setDrawer({ kind: 'person', personKey })}
          />
        )}
        {tab === 'bundles' && (
          <>
            {scopedBundles.length > 0 && (
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Licences are individual; bundles just assign several at once during onboarding or later.
                </p>
                <Button size="sm" onClick={() => setDrawer({ kind: 'bundle' })}>
                  <Plus aria-hidden="true" className="size-3.5" />
                  New bundle
                </Button>
              </div>
            )}
            <BundlesTable
              bundles={scopedBundles}
              showTenant={isGlobalView}
              onEdit={(bundleId) => setDrawer({ kind: 'bundle', bundleId })}
              onCreate={() => setDrawer({ kind: 'bundle' })}
            />
          </>
        )}
        {tab === 'baseline' &&
          (selectedTenant ? (
            <BaselineEditor key={selectedTenant.id} tenantId={selectedTenant.id} people={people} onNotice={handleChanged} />
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="Choose a client"
              description="Each client has its own baseline. Pick one in the client switcher at the top of the page."
            />
          ))}
        {tab === 'catalogue' && <SoftwareCatalogTable rows={rows} />}
      </Card>

      {openPool && (
        <PoolDrawer
          key={openPool.pool.id}
          row={openPool}
          people={people}
          onClose={() => setDrawer(null)}
          onChanged={handleChanged}
        />
      )}
      {drawer?.kind === 'bundle' && (
        <BundleDrawer
          key={drawer.bundleId ?? 'new'}
          bundle={openBundle}
          onClose={() => setDrawer(null)}
          onSaved={(message) => {
            handleChanged(message);
            setDrawer(null);
          }}
        />
      )}
      {drawer?.kind === 'person' && (
        <PersonLicencesDrawer
          people={people}
          personKey={drawer.personKey}
          onClose={() => setDrawer(null)}
          onSaved={(message) => {
            handleChanged(message);
            setDrawer(null);
          }}
        />
      )}
    </div>
  );
}
