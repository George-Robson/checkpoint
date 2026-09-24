import { cn } from '../../../lib/cn';
import type { KitIconKey } from '../../../types/kit';
import { KIT_ICONS } from '../constants/kitIconMeta';

interface KitIconBadgeProps {
  icon: KitIconKey;
  size?: 'sm' | 'md';
}

export function KitIconBadge({ icon, size = 'md' }: KitIconBadgeProps) {
  const Icon = KIT_ICONS[icon].icon;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-indigo-600',
        size === 'sm' ? 'size-8 rounded-md' : 'size-10 rounded-lg',
      )}
    >
      <Icon className={size === 'sm' ? 'size-4' : 'size-5'} />
    </span>
  );
}
