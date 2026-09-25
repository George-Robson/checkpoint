import type { ReactNode } from 'react';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import type { SoftwareProduct } from '../../../types/software';
import { SoftwareLogo } from './SoftwareLogo';

interface SoftwareOptionProps {
  product: SoftwareProduct;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Small tag next to the name, e.g. "Baseline" or "Recommended". */
  badge?: ReactNode;
  /** Line under the description, e.g. seat availability. */
  note?: ReactNode;
}

export function SoftwareOption({ product, checked, onChange, disabled = false, badge, note }: SoftwareOptionProps) {
  return (
    <label
      className={cn(
        'flex gap-3 rounded-lg border px-3 py-3 transition-colors',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        checked ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-2.5 size-4 shrink-0 accent-indigo-600"
      />
      <SoftwareLogo product={product} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-slate-900">{product.name}</span>
          {badge}
        </span>
        <span className="block text-xs text-slate-500">
          {product.vendor} · {product.detail}
        </span>
        {note && <span className="mt-1 block text-xs">{note}</span>}
      </span>
      <span className="shrink-0 text-xs tabular-nums text-slate-500">
        {product.monthlyPricePerSeat === 0 ? 'Included' : `${formatCurrency(product.monthlyPricePerSeat)}/mo`}
      </span>
    </label>
  );
}
