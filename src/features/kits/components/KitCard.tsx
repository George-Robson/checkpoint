import { ArrowRight, Truck } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import type { Kit } from '../../../types/kit';
import type { KitDraft } from '../types/kitDraft';
import { kitMonthlyPrice, resolveKitLines } from '../utils/kitPricing';
import { specSummary } from '../utils/specSummary';
import { CatalogImage } from './CatalogImage';
import { KitIconBadge } from './KitIconBadge';

interface KitCardProps {
  kit: Kit | KitDraft;
  /** Omit to render a static preview (e.g. in the kit builder). */
  onSelect?: () => void;
}

const CARD_CLASSES = 'flex w-full flex-col rounded-lg border border-slate-200 bg-white p-5 text-left';

export function KitCard({ kit, onSelect }: KitCardProps) {
  const resolved = resolveKitLines(kit.lines);

  const body = (
    <>
      <div className="flex w-full items-start justify-between gap-4">
        <KitIconBadge icon={kit.icon} />
        {kit.audience && <Badge tone="slate">{kit.audience}</Badge>}
      </div>

      <h2 className="mt-4 text-base font-medium text-slate-900">{kit.name || 'Untitled kit'}</h2>
      {kit.tagline && <p className="mt-1 text-sm text-slate-500">{kit.tagline}</p>}

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {resolved.map((line) => (
          <li key={line.item.id} className="flex items-center gap-3">
            <CatalogImage item={line.item} size="sm" />
            <span className="min-w-0">
              <span className="block truncate">
                {line.quantity > 1 && <span className="tabular-nums text-slate-500">{line.quantity}× </span>}
                {line.item.name}
              </span>
              {line.item.specs && (
                <span className="block text-xs text-slate-500">{specSummary(line.item)}</span>
              )}
            </span>
          </li>
        ))}
        {resolved.length === 0 && <li className="text-slate-400">No items yet</li>}
      </ul>

      <div className="mt-auto w-full pt-6">
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            <p>
              <span className="text-base font-medium text-slate-900">{formatCurrency(kitMonthlyPrice(kit.lines))}</span>
              <span className="text-sm text-slate-500"> / month</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Truck aria-hidden="true" className="size-3.5" />
              Ships in {kit.leadTimeDays} {kit.leadTimeDays === 1 ? 'day' : 'days'}
            </p>
          </div>
          {onSelect && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
              Configure
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (!onSelect) return <div className={CARD_CLASSES}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        CARD_CLASSES,
        'group transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
      )}
    >
      {body}
    </button>
  );
}
