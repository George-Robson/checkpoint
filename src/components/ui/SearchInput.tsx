import type { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange, className, ...inputProps }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 [&::-webkit-search-cancel-button]:appearance-none"
        {...inputProps}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </div>
  );
}
