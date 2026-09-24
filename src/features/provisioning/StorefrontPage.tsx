import { useCallback, useMemo, useState } from 'react';
import { PackagePlus, Settings2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { newKitPath, paths } from '../../app/paths';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import type { Order } from '../../types/order';
import { useKits } from '../kits/hooks/useKits';
import { isClientKit, type ClientKit } from '../kits/utils/isClientKit';
import { useOrders } from '../orders/hooks/useOrders';
import { useSession } from '../session/hooks/useSession';
import { canEditKit } from '../session/utils/permissions';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { KitGrid } from './components/KitGrid';
import { KitOrderDrawer } from './components/KitOrderDrawer';
import { RecentOrdersTable } from './components/RecentOrdersTable';
import { StorefrontClientPicker } from './components/StorefrontClientPicker';

export function StorefrontPage() {
  const { selectedTenant, isGlobalView, tenants, selectTenant } = useTenant();
  const { currentUser } = useSession();
  const { kits } = useKits();
  const { orders } = useOrders();
  const scopedOrders = useTenantScoped(orders);
  const [selectedKit, setSelectedKit] = useState<ClientKit | null>(null);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);

  const clientKits = useMemo(() => kits.filter(isClientKit), [kits]);
  const tenantKits = selectedTenant ? clientKits.filter((kit) => kit.ownerTenantId === selectedTenant.id) : [];
  const kitCountByTenant = useMemo(() => {
    const counts = new Map<string, number>();
    for (const kit of clientKits) counts.set(kit.ownerTenantId, (counts.get(kit.ownerTenantId) ?? 0) + 1);
    return counts;
  }, [clientKits]);

  const closeDrawer = useCallback(() => setSelectedKit(null), []);
  const handleOrderPlaced = useCallback((order: Order) => setLastPlacedOrderId(order.id), []);
  const canCreateKit = selectedTenant !== null && canEditKit(currentUser, { ownerTenantId: selectedTenant.id });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Storefront"
        description={
          selectedTenant
            ? `Hardware orders for ${selectedTenant.name}: replacements, extra devices and new sites. For new starters, use Onboarding.`
            : 'Hardware orders: replacements, extra devices and new sites. For new starters, use Onboarding.'
        }
        actions={
          <>
            <Link to={paths.kits} className={buttonClasses('secondary', 'md')}>
              <Settings2 aria-hidden="true" className="size-4" />
              Manage kits
            </Link>
            <Link to={paths.newOnboarding} className={buttonClasses('primary', 'md')}>
              <UserPlus aria-hidden="true" className="size-4" />
              Onboard a new hire
            </Link>
          </>
        }
      />

      {isGlobalView ? (
        <StorefrontClientPicker tenants={tenants} kitCountByTenant={kitCountByTenant} onSelect={selectTenant} />
      ) : tenantKits.length > 0 ? (
        <KitGrid kits={tenantKits} onSelect={setSelectedKit} />
      ) : (
        <Card>
          <EmptyState
            icon={PackagePlus}
            title="No kits yet"
            description={`${selectedTenant?.name ?? 'This client'} doesn't have any kits. Start from a Checkpoint template or build one from scratch.`}
            action={
              canCreateKit &&
              selectedTenant && (
                <Link to={newKitPath(selectedTenant.id)} className={buttonClasses('primary', 'sm')}>
                  Create a kit
                </Link>
              )
            }
          />
        </Card>
      )}

      <RecentOrdersTable orders={scopedOrders} showTenant={isGlobalView} highlightOrderId={lastPlacedOrderId} />

      {selectedKit && (
        <KitOrderDrawer
          key={selectedKit.id}
          kit={selectedKit}
          onClose={closeDrawer}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}
