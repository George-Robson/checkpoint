import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: ReactNode;
}

interface RadioGroupProps<T extends string> {
  name: string;
  legend: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
}

/** Card-style radio options for choices that need a line of explanation. */
export function RadioGroup<T extends string>({ name, legend, value, options, onChange }: RadioGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-900">{legend}</legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition-colors',
                checked ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-4 shrink-0 accent-indigo-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{option.label}</span>
                {option.description && <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
