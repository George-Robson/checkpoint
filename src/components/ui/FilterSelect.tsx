import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface FilterSelectOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  options: FilterSelectOption<T>[];
  onChange: (value: T) => void;
  /** Highlights the control when it narrows the results. */
  active?: boolean;
}

export function FilterSelect<T extends string>({ label, value, options, onChange, active = false }: FilterSelectProps<T>) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(
          'h-9 appearance-none rounded-md border pl-3 pr-8 text-sm font-medium focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600',
          active
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2',
          active ? 'text-indigo-500' : 'text-slate-400',
        )}
      />
    </div>
  );
}
