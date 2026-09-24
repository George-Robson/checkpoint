import { useState } from 'react';
import { CircleCheck, KeyRound, Tags, UserPlus, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { paths } from '../../app/paths';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { softwareProducts } from '../../data/mockData';
import { useTenant } from '../tenants/hooks/useTenant';
import { LicenceSummary } from './components/LicenceSummary';
import { PeopleTable } from './components/PeopleTable';
import { PersonLicencesDrawer } from './components/PersonLicencesDrawer';
import { PoolDrawer } from './components/PoolDrawer';
import { PoolsTable } from './components/PoolsTable';
import { SoftwareCatalogTable } from './components/SoftwareCatalogTable';
import { useLicensedPeople } from './hooks/useLicensedPeople';
import { usePoolRows } from './hooks/usePoolRows';

type LicencesTab = 'pools' | 'people' | 'catalogue';
const TABS: LicencesTab[] = ['pools', 'people', 'catalogue'];
const TAB_PANEL_ID = 'licences-tab-panel';

/** Which drawer is open: a pool, a specific person, or the "choose a person" flow. */
type OpenDrawer = { kind: 'pool'; poolId: string } | { kind: 'person'; personKey?: string } | null;

export function LicencesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedTenant, isGlobalView } = useTenant();
  const rows = usePoolRows();
  const people = useLicensedPeople();
  const [drawer, setDrawer] = useState<OpenDrawer>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requested = searchParams.get('tab') as LicencesTab | null;
  const tab: LicencesTab = requested && TABS.includes(requested) ? requested : 'pools';
  const openPool = drawer?.kind === 'pool' ? rows.find((row) => row.pool.id === drawer.poolId) : undefined;

  const tabItems: TabItem<LicencesTab>[] = [
    { value: 'pools', label: 'Seat pools', icon: KeyRound, count: rows.length },
    { value: 'people', label: 'People', icon: Users, count: people.length },
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
