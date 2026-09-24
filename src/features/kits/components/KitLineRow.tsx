import { X } from 'lucide-react';
import { QuantityStepper } from '../../../components/ui/QuantityStepper';
import { formatCurrency } from '../../../lib/currency';
import type { CatalogItem } from '../../../types/catalog';
import { specSummary } from '../utils/specSummary';
import { CatalogImage } from './CatalogImage';

interface KitLineRowProps {
  item: CatalogItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function KitLineRow({ item, quantity, onQuantityChange, onRemove }: KitLineRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <CatalogImage item={item} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
        <p
          className="truncate text-xs text-slate-500"
          title={item.specs?.map((spec) => `${spec.label}: ${spec.value}`).join('\n')}
        >
          {specSummary(item)}
        </p>
        <p className="text-xs text-slate-400">{formatCurrency(item.monthlyPrice)}/mo each</p>
      </div>
      <QuantityStepper value={quantity} onChange={onQuantityChange} label={item.name} />
      <span className="w-14 shrink-0 text-right text-sm tabular-nums text-slate-900">
        {formatCurrency(item.monthlyPrice * quantity)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}
