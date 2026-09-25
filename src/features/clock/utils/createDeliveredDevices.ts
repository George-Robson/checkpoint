import { HOME_DELIVERY } from '../../../constants/delivery';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { LEASE_TERM_MONTHS, WARRANTY_MONTHS } from '../../../data/mockData';
import type { Device, DeviceType } from '../../../types/device';
import type { Kit } from '../../../types/kit';
import type { Order } from '../../../types/order';
import { resolveKitLines } from '../../kits/utils/kitPricing';
import { getTenantSites } from '../../tenants/utils/getTenantSites';
import { getTenant } from '../../tenants/utils/tenantLookup';

/** Hostname segment per device type, matching the seeded naming scheme (e.g. ACME-LT-0142). */
const TYPE_CODES: Record<DeviceType, string> = {
  'windows-laptop': 'LT',
  macbook: 'MB',
  workstation: 'WS',
  'voip-phone': 'PH',
  smartphone: 'MOB',
  'rack-server': 'SRV',
  'virtual-instance': 'VM',
  switch: 'SW',
  firewall: 'FW',
  'access-point': 'AP',
};

function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

/** Deterministic, locally administered MAC address (02:…) so new devices never clash with real vendor prefixes. */
function macFor(seed: number): string {
  const bytes = [0x02, 0xc4, (seed >> 24) & 0xff, (seed >> 16) & 0xff, (seed >> 8) & 0xff, seed & 0xff];
  return bytes.map((byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

export interface DeliveredDevices {
  /** Devices that didn't exist yet. */
  created: Device[];
  /** Devices already in the fleet as 'provisioning' for this order, now online: id → changes. */
  activated: Record<string, Partial<Device>>;
}

/**
 * Turns delivered orders into fleet devices: one per managed hardware unit, assigned to the recipient
 * (user kits) or located at the new site (site kits). A matching 'provisioning' device already in the
 * fleet is activated instead of duplicated; anything else is created with a hostname in the tenant's scheme.
 */
export function createDeliveredDevices(
  delivered: Order[],
  kits: Kit[],
  existing: Device[],
  today: string,
  nowIso: string,
): DeliveredDevices {
  const created: Device[] = [];
  const activated: Record<string, Partial<Device>> = {};

  for (const order of delivered) {
    const kit = kits.find((candidate) => candidate.id === order.kitId);
    const tenant = getTenant(order.tenantId);
    if (!kit || !tenant) continue;

    const subnet = existing
      .find((device) => device.tenantId === order.tenantId && device.ipAddress)
      ?.ipAddress?.split('.')
      .slice(0, 3)
      .join('.');
    const isSiteKit = kit.assignmentTarget === 'site';
    // Older orders have no delivery address recorded; they went to the client's main site.
    const shipTo = order.shipTo ?? getTenantSites(order.tenantId)[0] ?? HOME_DELIVERY;
    const location = isSiteKit ? order.assignee : shipTo === HOME_DELIVERY ? 'Remote' : shipTo;

    for (const line of resolveKitLines(kit.lines)) {
      const type = line.item.deviceType;
      if (!type) continue;

      for (let unit = 0; unit < line.quantity; unit += 1) {
        const placeholder = existing.find(
          (device) =>
            device.status === 'provisioning' &&
            device.tenantId === order.tenantId &&
            device.type === type &&
            !activated[device.id] &&
            (isSiteKit ? device.location === order.assignee : device.assignedUser === order.assignee),
        );
        const seed = existing.length + created.length + Object.keys(activated).length * 31 + unit * 97;
        const ipAddress = subnet ? `${subnet}.${200 + (seed % 50)}` : null;

        if (placeholder) {
          activated[placeholder.id] = {
            status: 'active',
            ipAddress: placeholder.ipAddress ?? ipAddress,
            lastSeen: nowIso,
            acquisition: order.acquisition,
          };
          continue;
        }

        const prefix = `${tenant.shortCode}-${TYPE_CODES[type]}-`;
        const highest = [...existing, ...created]
          .filter((device) => device.name.startsWith(prefix))
          .reduce((max, device) => Math.max(max, Number(device.name.slice(prefix.length)) || 0), 0);
        const serial = highest + 1;

        created.push({
          id: `d-${order.id}-${created.length + 1}`,
          name: `${prefix}${String(serial).padStart(4, '0')}`,
          model: line.item.name,
          type,
          category: DEVICE_TYPE_META[type].category,
          tenantId: order.tenantId,
          assignedUser: isSiteKit ? null : order.assignee,
          status: 'active',
          ipAddress,
          macAddress: macFor(seed + serial),
          location,
          acquisition: order.acquisition,
          termStartDate: today,
          termEndDate: addMonths(today, order.acquisition === 'purchase' ? WARRANTY_MONTHS : LEASE_TERM_MONTHS),
          lastSeen: nowIso,
        });
      }
    }
  }

  return { created, activated };
}
