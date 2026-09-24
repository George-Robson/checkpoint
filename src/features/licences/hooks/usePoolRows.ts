import { useMemo } from 'react';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import type { PoolRow } from '../types/poolRow';
import { getSoftwareProduct } from '../utils/softwareLookup';
import { useLicences } from './useLicences';

/** Seat pools in scope with usage and cost, ordered by client then product. */
export function usePoolRows(): PoolRow[] {
  const { pools, assignments } = useLicences();
  const scopedPools = useTenantScoped(pools);

  return useMemo(
    () =>
      scopedPools
        .flatMap((pool) => {
          const product = getSoftwareProduct(pool.softwareId);
          if (!product) return [];
          const holders = assignments.filter((a) => a.tenantId === pool.tenantId && a.softwareId === pool.softwareId);
          const free = Math.max(0, pool.seats - holders.length);
          return [
            {
              pool,
              product,
              holders,
              used: holders.length,
              free,
              monthlyCost: pool.seats * product.monthlyPricePerSeat,
              unusedCost: free * product.monthlyPricePerSeat,
            },
          ];
        })
        .sort(
          (a, b) =>
            getTenantName(a.pool.tenantId).localeCompare(getTenantName(b.pool.tenantId)) ||
            a.product.name.localeCompare(b.product.name),
        ),
    [scopedPools, assignments],
  );
}
