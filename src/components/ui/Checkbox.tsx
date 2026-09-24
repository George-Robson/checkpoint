import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CheckboxProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export function Checkbox({ label, description, checked, onChange, disabled = false, invalid = false }: CheckboxProps) {
  return (
    <label className={cn('flex gap-3', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.checked)}
        className={cn('mt-0.5 size-4 shrink-0 accent-indigo-600', invalid && 'outline-2 outline-offset-1 outline-rose-500')}
      />
      <span>
        <span className={cn('block text-sm', disabled ? 'text-slate-500' : 'text-slate-900')}>{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
