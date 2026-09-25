import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import type { CatalogItem } from '../../../types/catalog';
import { CatalogImage } from './CatalogImage';
import { SpecList } from './SpecList';

/** Specs shown as tags on the card; the rest sit behind "Show all specs". */
const KEY_SPEC_COUNT = 4;

interface CatalogPickerItemProps {
  item: CatalogItem;
  selected: boolean;
  inKit: boolean;
  onToggle: (selected: boolean) => void;
}

export function CatalogPickerItem({ item, selected, inKit, onToggle }: CatalogPickerItemProps) {
  const [specsOpen, setSpecsOpen] = useState(false);
  const specsId = useId();
  const specs = item.specs ?? [];

  return (
    <li
      className={cn(
        'rounded-lg border transition-colors',
        selected ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' : 'border-slate-200',
        inKit && 'bg-slate-50',
      )}
    >
      <label className={cn('flex gap-3 p-4', inKit ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <input
          type="checkbox"
          checked={selected || inKit}
          disabled={inKit}
          onChange={(event) => onToggle(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-indigo-600"
        />
        <CatalogImage item={item} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-4">
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{item.name}</span>
                {inKit && <Badge tone="slate">In kit</Badge>}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {item.vendor} · {item.detail}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="text-sm font-medium tabular-nums text-slate-900">{formatCurrency(item.monthlyPrice)}</span>
              <span className="text-xs text-slate-500"> /mo</span>
              <span className="block text-xs tabular-nums text-slate-500">or {formatCurrency(item.purchasePrice)} to buy</span>
            </span>
          </span>
          {specs.length > 0 && (
            <span className="mt-2.5 flex flex-wrap gap-1.5">
              {specs.slice(0, KEY_SPEC_COUNT).map((spec) => (
                <span
                  key={spec.label}
                  title={spec.label}
                  className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
                >
                  {spec.value}
                </span>
              ))}
            </span>
          )}
        </span>
      </label>

      {specs.length > KEY_SPEC_COUNT && (
        <div className="-mt-2 pb-3 pl-42 pr-4">
          <button
            type="button"
            aria-expanded={specsOpen}
            aria-controls={specsId}
            onClick={() => setSpecsOpen((open) => !open)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            {specsOpen ? 'Hide specs' : `Show all ${specs.length} specs`}
            <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform', specsOpen && 'rotate-180')} />
          </button>
          {specsOpen && (
            <div id={specsId} className="mt-2 pb-1">
              <SpecList specs={specs} />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
