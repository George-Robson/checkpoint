import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { tenants as allTenants } from '../../../data/mockData';
import { useSession } from '../../session/hooks/useSession';
import { GLOBAL_VIEW_ID } from '../constants/globalView';
import { TenantContext, type TenantContextValue } from './TenantContext';

const STORAGE_KEY = 'checkpoint.selectedTenantId';

function readStoredTenantId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === GLOBAL_VIEW_ID || allTenants.some((tenant) => tenant.id === stored))) {
      return stored;
    }
  } catch {
    // Storage unavailable (private mode, blocked site data): fall back to Global View.
  }
  return GLOBAL_VIEW_ID;
}

interface TenantProviderProps {
  children: ReactNode;
}

/** Tenant scope for every view. Must sit inside SessionProvider: client admins are locked to their tenant. */
export function TenantProvider({ children }: TenantProviderProps) {
  const { currentUser } = useSession();
  const [storedTenantId, setStoredTenantId] = useState(readStoredTenantId);
  const lockedTenantId = currentUser.tenantId;

  const selectTenant = useCallback(
    (tenantId: string) => {
      if (lockedTenantId) return;
      setStoredTenantId(tenantId);
      try {
        localStorage.setItem(STORAGE_KEY, tenantId);
      } catch {
        // Non-critical: the selection just won't survive a reload.
      }
    },
    [lockedTenantId],
  );

  const value = useMemo<TenantContextValue>(() => {
    const selectedTenantId = lockedTenantId ?? storedTenantId;
    const selectedTenant = allTenants.find((tenant) => tenant.id === selectedTenantId) ?? null;
    return {
      tenants: lockedTenantId ? allTenants.filter((tenant) => tenant.id === lockedTenantId) : allTenants,
      selectedTenantId,
      selectedTenant,
      isGlobalView: selectedTenant === null,
      isLocked: Boolean(lockedTenantId),
      selectTenant,
    };
  }, [lockedTenantId, storedTenantId, selectTenant]);

  return <TenantContext value={value}>{children}</TenantContext>;
}
