import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** id of the panel the tabs control. */
  controls?: string;
}

/** Underlined page-level tabs with optional icon and count. */
export function Tabs<T extends string>({ items, value, onChange, ariaLabel, controls }: TabsProps<T>) {
  return (
    <div className="border-b border-slate-200">
      <div role="tablist" aria-label={ariaLabel} className="-mb-px flex gap-6 overflow-x-auto">
        {items.map((item) => {
          const selected = item.value === value;
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={controls}
              onClick={() => onChange(item.value)}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                selected
                  ? 'border-indigo-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              )}
            >
              {Icon && <Icon aria-hidden="true" className={cn('size-4', selected ? 'text-indigo-600' : 'text-slate-400')} />}
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.5 text-xs tabular-nums',
                    selected ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
