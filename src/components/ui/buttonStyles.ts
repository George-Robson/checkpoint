import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  /** Irreversible actions only (e.g. immediate device wipes). */
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-9 gap-2 px-4 text-sm',
};

/** Shared by <Button> and router <Link>s that need to look like buttons. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
