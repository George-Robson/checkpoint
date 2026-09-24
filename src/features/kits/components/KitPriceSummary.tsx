import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { LEASE_TERM_MONTHS } from '../../../data/mockData';
import { formatCurrency } from '../../../lib/currency';
import type { Kit, KitAssignmentTarget, KitLine } from '../../../types/kit';
import { softwareMonthlyCost } from '../../licences/utils/softwareLookup';
import { CATALOG_KIND_META, CATALOG_KIND_ORDER } from '../constants/catalogKindMeta';
import { kitMonthlyPrice, kitPriceByKind } from '../utils/kitPricing';

interface KitPriceSummaryProps {
  lines: KitLine[];
  assignmentTarget: KitAssignmentTarget;
  recommendedSoftwareIds: string[];
  /** The template this kit came from, to show the price difference. */
  sourceTemplate: Kit | undefined;
}

export function KitPriceSummary({ lines, assignmentTarget, recommendedSoftwareIds, sourceTemplate }: KitPriceSummaryProps) {
  const byKind = kitPriceByKind(lines);
  const total = kitMonthlyPrice(lines);
  const templateTotal = sourceTemplate ? kitMonthlyPrice(sourceTemplate.lines) : null;
  const difference = templateTotal === null ? 0 : total - templateTotal;

  return (
    <Card>
      <CardHeader title="Monthly hardware price" description="Calculated from catalogue prices." />
      <dl className="space-y-2 px-4 py-4 text-sm">
        {CATALOG_KIND_ORDER.map((kind) => (
          <div key={kind} className="flex justify-between gap-4">
            <dt className="text-slate-500">{CATALOG_KIND_META[kind].shortLabel}</dt>
            <dd className="tabular-nums text-slate-900">{formatCurrency(byKind[kind])}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-3">
          <dt className="font-medium text-slate-900">Total</dt>
          <dd>
            <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
            <span className="text-slate-500"> / {assignmentTarget === 'site' ? 'site' : 'seat'} / month</span>
          </dd>
        </div>
      </dl>
      <div className="space-y-1 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <p>{LEASE_TERM_MONTHS}-month lease with support, imaging and returns included.</p>
        {recommendedSoftwareIds.length > 0 && (
          <p>
            Recommended software adds about {formatCurrency(softwareMonthlyCost(recommendedSoftwareIds))} per person
            per month, licensed separately at onboarding.
          </p>
        )}
        {sourceTemplate && templateTotal !== null && (
          <p>
            {difference === 0
              ? `Same price as the ${sourceTemplate.name} template.`
              : `${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'more' : 'less'} than the ${sourceTemplate.name} template (${formatCurrency(templateTotal)}).`}
          </p>
        )}
      </div>
    </Card>
  );
}
