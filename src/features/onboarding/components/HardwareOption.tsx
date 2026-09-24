import type { ReactNode } from 'react';
import { cn } from '../../../lib/cn';

interface HardwareOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  media: ReactNode;
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
}

/** A radio card in the hardware step (a kit, or "No hardware"). */
export function HardwareOption({ name, value, checked, onSelect, media, title, subtitle, meta, aside }: HardwareOptionProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600',
        checked ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50',
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      {media}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900">{title}</span>
        {subtitle && <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>}
        {meta && <span className="mt-1.5 block text-xs text-slate-500">{meta}</span>}
      </span>
      {aside && <span className="shrink-0 text-right">{aside}</span>}
    </label>
  );
}
