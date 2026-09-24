import { createContext } from 'react';
import type { Tenant } from '../../../types/tenant';

export interface TenantContextValue {
  /** Tenants the current user may view (just their own for client admins). */
  tenants: Tenant[];
  /** A tenant id, or GLOBAL_VIEW_ID when viewing all clients. */
  selectedTenantId: string;
  selectedTenant: Tenant | null;
  isGlobalView: boolean;
  /** True for client admins: the scope is fixed to their organisation. */
  isLocked: boolean;
  selectTenant: (tenantId: string) => void;
}

export const TenantContext = createContext<TenantContextValue | null>(null);
