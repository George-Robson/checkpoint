import { useId, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { LEASE_TERM_MONTHS } from '../../../data/mockData';
import { formatCurrency } from '../../../lib/currency';
import { kitMonthlyPrice } from '../../kits/utils/kitPricing';
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

  function handlePlaced(order: Order) {
    setPlacedOrder(order);
    onOrderPlaced(order);
  }

  const footer = placedOrder ? (
    <div className="flex justify-end">
      <Button onClick={onClose}>Done</Button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm">
          <span className="font-medium text-slate-900">{formatCurrency(kitMonthlyPrice(kit.lines))}</span>
          <span className="text-slate-500"> / month</span>
        </p>
        <p className="text-xs text-slate-500">{LEASE_TERM_MONTHS}-month device lease · support included</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId}>
          Place order
        </Button>
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
        <KitOrderForm kit={kit} formId={formId} onPlaced={handlePlaced} />
      )}
    </Drawer>
  );
}
