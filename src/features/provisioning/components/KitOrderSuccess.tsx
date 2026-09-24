import { CircleCheck } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import type { Kit } from '../../../types/kit';
import type { Order } from '../../../types/order';
import { kitMonthlyPrice } from '../../kits/utils/kitPricing';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { OrderStatusBadge } from './OrderStatusBadge';

interface KitOrderSuccessProps {
  kit: Kit;
  order: Order;
}

export function KitOrderSuccess({ kit, order }: KitOrderSuccessProps) {
  const isSiteKit = kit.assignmentTarget === 'site';

  const summary = [
    { label: 'Order', value: order.reference },
    { label: 'Client', value: getTenantName(order.tenantId) },
    { label: isSiteKit ? 'Site' : 'Recipient', value: order.assignee },
    ...(isSiteKit ? [] : [{ label: 'Deliver to', value: order.shipTo ?? '—' }]),
    { label: isSiteKit ? 'Go-live date' : 'Needed by', value: order.startDate ? formatDate(order.startDate) : '—' },
    { label: 'Expected delivery', value: order.expectedDelivery ? formatDate(order.expectedDelivery) : '—' },
    { label: 'Monthly cost', value: `${formatCurrency(kitMonthlyPrice(kit.lines))} / month` },
  ];

  const nextSteps = isSiteKit
    ? [
        'Firewall, switch and access points are claimed in the management dashboard.',
        'The site network baseline (VLANs, SSIDs, HQ tunnel) is staged.',
        `Hardware ships to ${order.assignee} with tracking.`,
        'Devices pull their configuration automatically on first power-up.',
      ]
    : [
        'Devices are allocated from stock and enrolled in Intune / Apple Business Manager.',
        'Security baseline and management profiles are applied before dispatch.',
        `The kit ships to ${order.shipTo ?? 'the chosen address'} with tracking.`,
        `${order.assignee} signs in with their existing account; their licences are unchanged.`,
      ];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CircleCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-base font-medium text-slate-900">Order placed</p>
          <p className="mt-1 text-sm text-slate-500">
            {kit.name} for {order.assignee} is now being provisioned. You can track it under Recent orders.
          </p>
          <div className="mt-3">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {summary.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="text-right text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h3 className="text-sm font-medium text-slate-900">What happens next</h3>
        <ol className="mt-3 space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-600">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-medium tabular-nums text-slate-500">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
