import { useMemo } from 'react';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import { addDays, formatMonth, formatMonthLong, getNow } from '../../../lib/date';
import { daysUntilLeaseEnd } from '../../../lib/lease';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import type { LeaseExpiryBucket } from '../types/leaseExpiryBucket';

const MONTHS_AHEAD = 12;

/** Upcoming lease ends grouped by calendar month, starting with the current month. */
export function useLeaseExpiryTimeline(): LeaseExpiryBucket[] {
  const { devices } = useDevices();
  const scopedDevices = useTenantScoped(devices);

  return useMemo(() => {
    const now = getNow();
    const windowEnd = addDays(now, REFRESH_WINDOW_DAYS);

    const buckets: LeaseExpiryBucket[] = Array.from({ length: MONTHS_AHEAD }, (_, offset) => {
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
      return {
        key: monthStart.toISOString().slice(0, 7),
        label: formatMonth(monthStart),
        longLabel: formatMonthLong(monthStart),
        count: 0,
        devices: [],
        inRefreshWindow: monthStart <= windowEnd,
      };
    });

    const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    for (const device of scopedDevices) {
      if (daysUntilLeaseEnd(device, now) < 0) continue;
      const bucket = bucketByKey.get(device.leaseEndDate.slice(0, 7));
      if (bucket) {
        bucket.devices.push(device);
        bucket.count += 1;
      }
    }

    return buckets;
  }, [scopedDevices]);
}
