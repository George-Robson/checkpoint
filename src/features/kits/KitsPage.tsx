import { useMemo, useState } from 'react';
import { Boxes, LayoutTemplate, PackagePlus, Plus, Tags } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { catalogItems } from '../../data/mockData';
import { useSession } from '../session/hooks/useSession';
import { canViewKit } from '../session/utils/permissions';
import { useTenant } from '../tenants/hooks/useTenant';
import { CatalogTable } from './components/CatalogTable';
import { KitsTable } from './components/KitsTable';
import { NewKitDrawer } from './components/NewKitDrawer';
import { useKits } from './hooks/useKits';
import type { KitsTab } from './types/kitsTab';
import { isClientKit } from './utils/isClientKit';

const TAB_PANEL_ID = 'kits-tab-panel';
const TABS: KitsTab[] = ['kits', 'templates', 'catalogue'];

export function KitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const savedKitId = (location.state as { savedKitId?: string } | null)?.savedKitId ?? null;
  const { currentUser } = useSession();
  const { selectedTenant, isGlobalView } = useTenant();
  const { kits } = useKits();
  const [newKitOpen, setNewKitOpen] = useState(false);

  const requestedTab = searchParams.get('tab') as KitsTab | null;
  const tab: KitsTab = requestedTab && TABS.includes(requestedTab) ? requestedTab : 'kits';

  const { clientKits, templates, templateNameById, visibleKits } = useMemo(() => {
    const visible = kits.filter((kit) => canViewKit(currentUser, kit));
    const templateKits = visible.filter((kit) => kit.ownerTenantId === null);
    return {
      visibleKits: visible,
      templates: templateKits,
      templateNameById: new Map(kits.filter((kit) => kit.ownerTenantId === null).map((kit) => [kit.id, kit.name])),
      clientKits: visible
        .filter(isClientKit)
        .filter((kit) => isGlobalView || kit.ownerTenantId === selectedTenant?.id)
        .sort((a, b) => a.ownerTenantId.localeCompare(b.ownerTenantId) || a.name.localeCompare(b.name)),
    };
  }, [kits, currentUser, isGlobalView, selectedTenant]);

  const tabItems: TabItem<KitsTab>[] = [
    {
      value: 'kits',
      label: currentUser.tenantId ? 'Your kits' : selectedTenant ? `${selectedTenant.name} kits` : 'Client kits',
      icon: Boxes,
      count: clientKits.length,
    },
    { value: 'templates', label: 'Templates', icon: LayoutTemplate, count: templates.length },
    { value: 'catalogue', label: 'Catalogue', icon: Tags, count: catalogItems.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kits"
        description="Each client orders from its own kits. Start from a Checkpoint template and tailor it, or build one from scratch."
        actions={
          <Button onClick={() => setNewKitOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            New kit
          </Button>
        }
      />

      <Tabs
        items={tabItems}
        value={tab}
        onChange={(next) => setSearchParams(next === 'kits' ? {} : { tab: next }, { replace: true })}
        ariaLabel="Kit views"
        controls={TAB_PANEL_ID}
      />

      <Card id={TAB_PANEL_ID} role="tabpanel" className="overflow-hidden">
        {tab === 'kits' && (
          <KitsTable
            kits={clientKits}
            templateNameById={templateNameById}
            showClient={isGlobalView}
            showOrigin
            highlightKitId={savedKitId}
            empty={
              <EmptyState
                icon={PackagePlus}
                title="No kits yet"
                description="Create one from a template to give this client a storefront."
                action={
                  <Button size="sm" onClick={() => setNewKitOpen(true)}>
                    New kit
                  </Button>
                }
              />
            }
          />
        )}
        {tab === 'templates' && (
          <KitsTable
            kits={templates}
            templateNameById={templateNameById}
            showClient={false}
            showOrigin={false}
            highlightKitId={savedKitId}
            empty={<EmptyState icon={LayoutTemplate} title="No templates" />}
          />
        )}
        {tab === 'catalogue' && <CatalogTable kits={visibleKits} />}
      </Card>

      {newKitOpen && <NewKitDrawer onClose={() => setNewKitOpen(false)} />}
    </div>
  );
}
