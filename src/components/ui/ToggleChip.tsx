import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ToggleChipProps {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  icon?: LucideIcon;
  children: ReactNode;
}

export function ToggleChip({ pressed, onPressedChange, icon: Icon, children }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        pressed
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      )}
    >
      {Icon && <Icon aria-hidden="true" className={cn('size-4', pressed ? 'text-indigo-500' : 'text-slate-400')} />}
      {children}
    </button>
  );
}
