import { useMemo } from 'react';
import type { SeatAvailability } from '../types/seatAvailability';
import { useLicences } from './useLicences';

/** Seat usage per software product for one tenant (products without a pool are absent). */
export function useSeatAvailability(tenantId: string | null): Map<string, SeatAvailability> {
  const { pools, assignments } = useLicences();

  return useMemo(() => {
    const availability = new Map<string, SeatAvailability>();
    if (!tenantId) return availability;
    for (const pool of pools) {
      if (pool.tenantId !== tenantId) continue;
      const used = assignments.filter((a) => a.tenantId === tenantId && a.softwareId === pool.softwareId).length;
      availability.set(pool.softwareId, { seats: pool.seats, used, free: Math.max(0, pool.seats - used) });
    }
    return availability;
  }, [pools, assignments, tenantId]);
}
