import { devices } from '../../../data/mockData';

const CLOUD_LOCATION = /^(Azure|AWS)\b/;

/** Physical sites a tenant already has devices at (e.g. "Manchester HQ"), for delivery. */
export function getTenantSites(tenantId: string): string[] {
  const sites = new Set<string>();
  for (const device of devices) {
    if (device.tenantId !== tenantId) continue;
    const site = device.location.split(' · ')[0];
    if (!CLOUD_LOCATION.test(site)) sites.add(site);
  }
  return [...sites].sort();
}
