import { Layers } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import type { LicenceBundle } from '../../../types/licenceBundle';
import { softwareMonthlyCost } from '../utils/softwareLookup';
import { SoftwareLogoStack } from './SoftwareLogoStack';

interface BundlePickerProps {
  bundles: LicenceBundle[];
  /** Currently selected licences (a bundle is ticked when all of its licences are). */
  selectedIds: string[];
  onToggle: (bundle: LicenceBundle, included: boolean) => void;
}

/** Quick-pick for a client's licence bundles: ticking one selects all of its licences. */
export function BundlePicker({ bundles, selectedIds, onToggle }: BundlePickerProps) {
  if (bundles.length === 0) return null;
  const selected = new Set(selectedIds);

  return (
    <section>
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Layers aria-hidden="true" className="size-3.5" />
        Bundles
      </h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {bundles.map((bundle) => {
          const checked = bundle.softwareIds.length > 0 && bundle.softwareIds.every((id) => selected.has(id));
          const partial = !checked && bundle.softwareIds.some((id) => selected.has(id));
          return (
            <label
              key={bundle.id}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition-colors',
                checked ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                ref={(input) => {
                  if (input) input.indeterminate = partial;
                }}
                onChange={(event) => onToggle(bundle, event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-indigo-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">{bundle.name}</span>
                {bundle.description && <span className="block text-xs text-slate-500">{bundle.description}</span>}
                <span className="mt-2 flex items-center justify-between gap-3">
                  <SoftwareLogoStack softwareIds={bundle.softwareIds} />
                  <span className="text-xs tabular-nums text-slate-500">
                    {bundle.softwareIds.length} licences · {formatCurrency(softwareMonthlyCost(bundle.softwareIds))}/mo
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
