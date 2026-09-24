import { MonitorOff, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { newKitPath } from '../../../app/paths';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { HOME_DELIVERY } from '../../../constants/delivery';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { CatalogImage } from '../../kits/components/CatalogImage';
import { describeContents } from '../../kits/utils/describeContents';
import { kitMonthlyPrice, resolveKitLines } from '../../kits/utils/kitPricing';
import type { OnboardingWizard } from '../hooks/useOnboardingWizard';
import { NO_KIT } from '../types/onboardingDraft';
import { HardwareOption } from './HardwareOption';

interface HardwareStepProps {
  wizard: OnboardingWizard;
}

export function HardwareStep({ wizard }: HardwareStepProps) {
  const { draft, errors, tenant, tenantKits, selectedKit, kitDelivery, deliveryWarning, sites, selectKit, setField } =
    wizard;

  return (
    <Card>
      <CardHeader
        title="Hardware"
        description={`Choose one of ${tenant?.name ?? 'the client'}'s kits. Its recommended software is pre-selected in the next step.`}
      />
      <div className="space-y-5 p-4">
        <fieldset>
          <legend className="sr-only">Kit</legend>
          <div role="radiogroup" aria-invalid={Boolean(errors.kitId)} className="space-y-3">
            {tenantKits.map((kit) => {
              const mainItem = resolveKitLines(kit.lines)[0]?.item;
              return (
                <HardwareOption
                  key={kit.id}
                  name="onboarding-kit"
                  value={kit.id}
                  checked={draft.kitId === kit.id}
                  onSelect={() => selectKit(kit.id)}
                  media={
                    mainItem ? (
                      <CatalogImage item={mainItem} size="lg" />
                    ) : (
                      <span className="h-20 w-28 shrink-0 rounded-md border border-slate-200 bg-slate-50" />
                    )
                  }
                  title={kit.name}
                  subtitle={kit.tagline}
                  meta={`${describeContents(kit.lines)} · ships in ${kit.leadTimeDays} days`}
                  aside={
                    <>
                      <span className="text-sm font-medium tabular-nums text-slate-900">
                        {formatCurrency(kitMonthlyPrice(kit.lines))}
                      </span>
                      <span className="text-xs text-slate-500">/mo</span>
                    </>
                  }
                />
              );
            })}
            <HardwareOption
              name="onboarding-kit"
              value={NO_KIT}
              checked={draft.kitId === NO_KIT}
              onSelect={() => selectKit(NO_KIT)}
              media={
                <span className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-400">
                  <MonitorOff aria-hidden="true" className="size-6" />
                </span>
              }
              title="No hardware"
              subtitle="They already have a device, or will use a spare. Only licences are assigned."
            />
          </div>
          {errors.kitId && <p className="mt-2 text-xs text-rose-600">{errors.kitId}</p>}
          {tenantKits.length === 0 && tenant && (
            <p className="mt-3 text-sm text-slate-500">
              {tenant.name} has no kits for new hires yet.{' '}
              <Link to={newKitPath(tenant.id)} className="font-medium text-indigo-600 hover:text-indigo-700">
                Create one
              </Link>
            </p>
          )}
        </fieldset>

        {selectedKit && (
          <div className="grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <FormField
              label="Deliver to"
              error={errors.shipTo}
              hint={kitDelivery ? `Expected ${formatDate(kitDelivery)}` : undefined}
            >
              {(controlProps) => (
                <Select {...controlProps} value={draft.shipTo} onChange={(event) => setField('shipTo', event.target.value)}>
                  {sites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                  <option value={HOME_DELIVERY}>{HOME_DELIVERY}</option>
                </Select>
              )}
            </FormField>
            {deliveryWarning && (
              <p className="flex gap-2 self-start rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
                {deliveryWarning} Consider a later start date.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
