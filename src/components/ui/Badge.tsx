import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { Tone } from './tone';

const toneClasses: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  slate: 'bg-slate-50 text-slate-600 ring-slate-500/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

interface BadgeProps {
  tone: Tone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
