import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { inputClasses } from './inputStyles';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';
  return (
    <div className="relative">
      <select className={inputClasses(invalid, `h-9 appearance-none pr-8 ${className ?? ''}`)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
