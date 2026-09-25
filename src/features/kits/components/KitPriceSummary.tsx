import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { LEASE_TERM_MONTHS, DEVICE_MANAGEMENT_FEE, WARRANTY_MONTHS } from '../../../data/mockData';
import { formatCurrency } from '../../../lib/currency';
import type { Kit, KitAssignmentTarget, KitLine } from '../../../types/kit';
import { softwareMonthlyCost } from '../../licences/utils/softwareLookup';
import { CATALOG_KIND_META, CATALOG_KIND_ORDER } from '../constants/catalogKindMeta';
import {
  costOverTerm,
  kitCost,
  kitManagedDeviceCount,
  kitMonthlyPrice,
  kitPriceByKind,
  leaseBreakdown,
} from '../utils/kitPricing';

interface KitPriceSummaryProps {
  lines: KitLine[];
  assignmentTarget: KitAssignmentTarget;
  recommendedSoftwareIds: string[];
  /** The template this kit came from, to show the price difference. */
  sourceTemplate: Kit | undefined;
}

export function KitPriceSummary({ lines, assignmentTarget, recommendedSoftwareIds, sourceTemplate }: KitPriceSummaryProps) {
  const byKind = kitPriceByKind(lines);
  const lease = kitCost(lines, 'lease');
  const purchase = kitCost(lines, 'purchase');
  const managedDevices = kitManagedDeviceCount(lines);
  const { management } = leaseBreakdown(lines);
  const managementLabel = `Management · ${managedDevices} ${managedDevices === 1 ? 'device' : 'devices'} × ${formatCurrency(DEVICE_MANAGEMENT_FEE)}`;
  const templateTotal = sourceTemplate ? kitMonthlyPrice(sourceTemplate.lines) : null;
  const difference = templateTotal === null ? 0 : lease.monthly - templateTotal;
  const per = assignmentTarget === 'site' ? 'site' : 'seat';

  return (
    <Card>
      <CardHeader
        title="Hardware price"
        description="Calculated from catalogue prices. Clients lease or buy outright when ordering."
      />
      <div className="px-4 py-4">
        <p className="text-xs font-medium text-slate-500">Lease</p>
        <dl className="mt-2 space-y-2 text-sm">
          {CATALOG_KIND_ORDER.map((kind) => (
            <div key={kind} className="flex justify-between gap-4">
              <dt className="text-slate-500">{CATALOG_KIND_META[kind].shortLabel}</dt>
              <dd className="tabular-nums text-slate-900">
                {/* Management is shown on its own line, so it comes out of the managed hardware's price. */}
                {formatCurrency(kind === 'hardware' ? byKind[kind] - management : byKind[kind])}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{managementLabel}</dt>
            <dd className="tabular-nums text-slate-900">{formatCurrency(management)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-3">
            <dt className="font-medium text-slate-900">Total</dt>
            <dd>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(lease.monthly)}</span>
              <span className="text-slate-500"> / {per} / month</span>
            </dd>
          </div>
        </dl>
      </div>
      <div className="border-t border-slate-100 px-4 py-4">
        <p className="text-xs font-medium text-slate-500">Buy outright</p>
        <dl className="mt-2 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-medium text-slate-900">Purchase price</dt>
            <dd>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(purchase.upfront)}</span>
              <span className="text-slate-500"> / {per}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{managementLabel}</dt>
            <dd className="tabular-nums text-slate-900">{formatCurrency(purchase.monthly)}/mo</dd>
          </div>
        </dl>
      </div>
      <div className="space-y-1 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <p>
          Leases run {LEASE_TERM_MONTHS} months with management, support, imaging and returns included. Bought hardware comes with a{' '}
          {WARRANTY_MONTHS / 12}-year warranty.
        </p>
        <p className="tabular-nums">
          Over {LEASE_TERM_MONTHS} months: leasing {formatCurrency(costOverTerm(lease))} · buying{' '}
          {formatCurrency(costOverTerm(purchase))}.
        </p>
        {recommendedSoftwareIds.length > 0 && (
          <p>
            Recommended software adds about {formatCurrency(softwareMonthlyCost(recommendedSoftwareIds))} per person
            per month, licensed separately at onboarding.
          </p>
        )}
        {sourceTemplate && templateTotal !== null && (
          <p>
            {difference === 0
              ? `Same lease price as the ${sourceTemplate.name} template.`
              : `${formatCurrency(Math.abs(difference))}/mo ${difference > 0 ? 'more' : 'less'} to lease than the ${sourceTemplate.name} template (${formatCurrency(templateTotal)}).`}
          </p>
        )}
      </div>
    </Card>
  );
}
