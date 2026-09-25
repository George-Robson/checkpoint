import { useId, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { LEASE_TERM_MONTHS } from '../../../data/mockData';
import { formatCurrency } from '../../../lib/currency';
import type { Acquisition } from '../../../types/acquisition';
import { AccountRestrictedNotice } from '../../billing/components/AccountRestrictedNotice';
import { useAccountStanding } from '../../billing/hooks/useAccountStanding';
import { kitCost, leaseBreakdown } from '../../kits/utils/kitPricing';
import { getTenant } from '../../tenants/utils/tenantLookup';
import type { Kit } from '../../../types/kit';
import type { Order } from '../../../types/order';
import { KitOrderForm } from './KitOrderForm';
import { KitOrderSuccess } from './KitOrderSuccess';

interface KitOrderDrawerProps {
  kit: Kit & { ownerTenantId: string };
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function KitOrderDrawer({ kit, onClose, onOrderPlaced }: KitOrderDrawerProps) {
  const formId = useId();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [acquisition, setAcquisition] = useState<Acquisition>(
    () => getTenant(kit.ownerTenantId)?.hardwarePreference ?? 'lease',
  );
  const cost = kitCost(kit.lines, acquisition);
  const standing = useAccountStanding(kit.ownerTenantId);
  const restricted = standing?.restricted ?? false;
  const { management } = leaseBreakdown(kit.lines);

  function handlePlaced(order: Order) {
    setPlacedOrder(order);
    onOrderPlaced(order);
  }

  const footer = placedOrder ? (
    <div className="flex justify-end">
      <Button onClick={onClose}>Done</Button>
    </div>
  ) : (
    <div className="space-y-3">
      {restricted && (
        <p className="text-xs text-rose-700">Ordering is paused until this client's overdue invoices are paid.</p>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          {acquisition === 'lease' ? (
            <>
              <p className="text-sm">
                <span className="font-medium text-slate-900">{formatCurrency(cost.monthly)}</span>
                <span className="text-slate-500"> / month</span>
              </p>
              <p className="text-xs text-slate-500">
                {LEASE_TERM_MONTHS}-month lease · includes {formatCurrency(management)}/mo management
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">
                <span className="font-medium text-slate-900">{formatCurrency(cost.upfront)}</span>
                <span className="text-slate-500"> one-off</span>
              </p>
              <p className="text-xs text-slate-500">Bought outright · + {formatCurrency(cost.monthly)}/mo management</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={restricted}>
            Place order
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Drawer
      title={placedOrder ? `Order ${placedOrder.reference}` : kit.name}
      description={placedOrder ? undefined : kit.tagline}
      onClose={onClose}
      footer={footer}
    >
      {placedOrder ? (
        <KitOrderSuccess kit={kit} order={placedOrder} />
      ) : (
        <div className="space-y-6">
          {standing && restricted && (
            <AccountRestrictedNotice
              standing={standing}
              clientName={getTenant(kit.ownerTenantId)?.name ?? 'this client'}
              action="New orders"
            />
          )}
          <KitOrderForm
            kit={kit}
            formId={formId}
            acquisition={acquisition}
            onAcquisitionChange={setAcquisition}
            onPlaced={handlePlaced}
          />
        </div>
      )}
    </Drawer>
  );
}
