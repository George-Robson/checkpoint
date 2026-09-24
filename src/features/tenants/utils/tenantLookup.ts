import { tenants } from '../../../data/mockData';
import type { Tenant } from '../../../types/tenant';

const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));

export function getTenant(tenantId: string): Tenant | null {
  return tenantById.get(tenantId) ?? null;
}

export function getTenantName(tenantId: string): string {
  return tenantById.get(tenantId)?.name ?? 'Unknown client';
}
