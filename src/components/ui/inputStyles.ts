import { cn } from '../../lib/cn';

/** Shared by Input, Select and Textarea so every form control reads the same. */
export function inputClasses(invalid = false, className?: string): string {
  return cn(
    'block w-full rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500',
    invalid
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600',
    className,
  );
}
