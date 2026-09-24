import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Render the icon only; the label stays available to screen readers. */
  iconOnly?: boolean;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-6 items-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors',
              selected ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {Icon && <Icon aria-hidden="true" className="size-3.5" />}
            <span className={option.iconOnly ? 'sr-only' : undefined}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
