import { Globe } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { initialsFor } from '../../../lib/initials';
import type { Tenant } from '../../../types/tenant';

interface TenantAvatarProps {
  /** Pass null to render the Global View mark. */
  tenant: Tenant | null;
  size?: 'sm' | 'md';
}

export function TenantAvatar({ tenant, size = 'md' }: TenantAvatarProps) {
  const sizeClasses = size === 'sm' ? 'size-6 text-[10px]' : 'size-8 text-xs';

  if (!tenant) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600',
          sizeClasses,
        )}
      >
        <Globe className={size === 'sm' ? 'size-3.5' : 'size-4'} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700',
        sizeClasses,
      )}
    >
      {initialsFor(tenant.name)}
    </span>
  );
}
