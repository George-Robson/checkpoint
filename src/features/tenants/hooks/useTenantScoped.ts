import { useMemo } from 'react';
import { useTenant } from './useTenant';

/** Narrows any tenant-keyed collection to the tenant selected in the switcher. */
export function useTenantScoped<T extends { tenantId: string }>(items: T[]): T[] {
  const { selectedTenantId, isGlobalView } = useTenant();

  return useMemo(
    () => (isGlobalView ? items : items.filter((item) => item.tenantId === selectedTenantId)),
    [items, isGlobalView, selectedTenantId],
  );
}
