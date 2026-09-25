import { TriangleAlert } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { formatCurrency } from '../../../lib/currency';
import { formatDate, formatRelativeDay } from '../../../lib/date';
import { suggestWorkEmail } from '../../../lib/workEmail';
import { CatalogImage } from '../../kits/components/CatalogImage';
import { kitCost, resolveKitLines } from '../../kits/utils/kitPricing';
import { ACQUISITION_META } from '../../orders/constants/acquisitionMeta';
import { describeKitCost } from '../../orders/utils/describeKitCost';
import { SeatNote } from '../../licences/components/SeatNote';
import { SoftwareLogo } from '../../licences/components/SoftwareLogo';
import { getSoftwareProduct } from '../../licences/utils/softwareLookup';
import type { OnboardingWizard } from '../hooks/useOnboardingWizard';
import { ReviewSection } from './ReviewSection';

interface ReviewStepProps {
  wizard: OnboardingWizard;
}

export function ReviewStep({ wizard }: ReviewStepProps) {
  const { draft, tenant, selectedKit, kitDelivery, deliveryWarning, softwareIds, availability, goTo } = wizard;
  const email = tenant ? suggestWorkEmail(draft.person, tenant.domain) : null;
  const products = softwareIds.flatMap((id) => getSoftwareProduct(id) ?? []);

  const nextSteps = [
    `${email ?? 'Their account'} is created and ${products.length} licences are reserved.`,
    selectedKit
      ? `The ${selectedKit.name} is enrolled and shipped to ${draft.shipTo}, arriving ${kitDelivery ? formatDate(kitDelivery) : 'before they start'}.`
      : 'No hardware is ordered; they sign in on an existing device.',
    `Licences activate on ${formatDate(draft.startDate)}, ready for their first day.`,
  ];

  return (
    <Card>
      <CardHeader title="Review" description="Check everything before starting the onboarding." />
      <div className="divide-y divide-slate-100">
        <ReviewSection title="New hire" onEdit={() => goTo('person')}>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {[
              ['Name', draft.person],
              ['Job title', draft.jobTitle || '—'],
              ['Client', tenant?.name ?? '—'],
              ['Account', email ?? '—'],
              ['Start date', `${formatDate(draft.startDate)} (${formatRelativeDay(draft.startDate)})`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </ReviewSection>

        <ReviewSection title="Hardware" onEdit={() => goTo('hardware')}>
          {selectedKit ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-900">
                {selectedKit.name} <span className="text-slate-500">· deliver to {draft.shipTo}</span>
              </p>
              <p className="text-sm text-slate-900">
                {ACQUISITION_META[draft.acquisition].label}{' '}
                <span className="tabular-nums text-slate-500">
                  · {describeKitCost(kitCost(selectedKit.lines, draft.acquisition))}
                </span>
              </p>
              <ul className="flex flex-wrap gap-3">
                {resolveKitLines(selectedKit.lines).map((line) => (
                  <li key={line.item.id} className="flex items-center gap-2 text-xs text-slate-700">
                    <CatalogImage item={line.item} size="sm" />
                    {line.quantity > 1 && `${line.quantity}× `}
                    {line.item.name}
                  </li>
                ))}
              </ul>
              {deliveryWarning && (
                <p className="flex gap-2 text-xs text-amber-800">
                  <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-amber-600" />
                  {deliveryWarning}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hardware. Only licences will be assigned.</p>
          )}
        </ReviewSection>

        <ReviewSection title={`Software (${products.length})`} onEdit={() => goTo('software')}>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-3">
                  <SoftwareLogo product={product} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-slate-900">{product.name}</span>
                    <span className="block text-xs">
                      <SeatNote product={product} availability={availability.get(product.id)} held={false} selected />
                    </span>
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {formatCurrency(product.monthlyPricePerSeat)}/mo
                </span>
              </li>
            ))}
          </ul>
        </ReviewSection>

        <section className="px-4 py-4">
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
    </Card>
  );
}
