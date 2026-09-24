import { cn } from '../../lib/cn';
import type { Tone } from './tone';

const toneClasses: Record<Tone, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-500',
};

interface StatusDotProps {
  tone: Tone;
  className?: string;
}

export function StatusDot({ tone, className }: StatusDotProps) {
  return (
    <span aria-hidden="true" className={cn('inline-block size-1.5 shrink-0 rounded-full', toneClasses[tone], className)} />
  );
}
