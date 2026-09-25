import { DEVICE_HEALTH_OVERRIDES, TENANT_EDR_PRODUCT } from '../../../data/serviceData';
import { stableUnit } from '../../../lib/hash';
import type { Device, DeviceType } from '../../../types/device';
import type { DeviceHealth, HealthLevel } from '../../../types/deviceHealth';

/** Devices updated by firmware rather than operating system patches. */
const FIRMWARE_TYPES: DeviceType[] = ['voip-phone', 'switch', 'firewall', 'access-point'];
/** Devices that run an EDR agent and have encrypted disks. */
const AGENT_TYPES: DeviceType[] = ['windows-laptop', 'macbook', 'workstation', 'rack-server', 'virtual-instance'];

/** Last Patch Tuesday before the demo date; most devices patched within a few days of it. */
const LAST_PATCH_TUESDAY = '2026-09-08';

function osVersion(device: Device): string {
  switch (device.type) {
    case 'windows-laptop':
    case 'workstation':
      return 'Windows 11 Pro 24H2';
    case 'macbook':
      return 'macOS 15.6';
    case 'smartphone':
      return device.model.startsWith('iPhone') ? 'iOS 18.6' : 'Android 15';
    case 'rack-server':
      return 'Windows Server 2022';
    case 'virtual-instance':
      return device.model.startsWith('AWS') ? 'Ubuntu 24.04 LTS' : 'Windows Server 2022';
    case 'voip-phone':
      return 'Firmware 8.4';
    default:
      return device.model.includes('Fortinet') ? 'FortiOS 7.4.8' : device.model.includes('Palo Alto') ? 'PAN-OS 11.2' : 'Meraki 18.2';
  }
}

function patchedOn(offsetDays: number): string {
  const date = new Date(`${LAST_PATCH_TUESDAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

/**
 * The device's health as the monitoring tool would report it. Derived deterministically from the device, so
 * new devices from orders get plausible data too; a few devices have a hand-written story (see serviceData).
 */
export function getDeviceHealth(device: Device): DeviceHealth {
  const seed = (key: string) => stableUnit(`${device.id}-${key}`);
  const firmware = FIRMWARE_TYPES.includes(device.type);
  const hasAgent = AGENT_TYPES.includes(device.type);
  const pending = seed('patch') > 0.82;

  const derived: DeviceHealth = {
    deviceId: device.id,
    osVersion: osVersion(device),
    patch: {
      status: pending ? 'pending' : 'current',
      missing: pending ? 1 + Math.floor(seed('missing') * 3) : 0,
      lastPatchedOn: patchedOn(firmware ? -40 - Math.floor(seed('fw') * 30) : 1 + Math.floor(seed('days') * 5)),
      kind: firmware ? 'firmware' : 'os',
    },
    edr: hasAgent ? 'active' : 'not-applicable',
    edrProduct: hasAgent ? (TENANT_EDR_PRODUCT[device.tenantId] ?? 'Microsoft Defender') : null,
    encryption: hasAgent || device.type === 'smartphone' ? 'encrypted' : 'not-applicable',
    diskFreePercent: hasAgent ? 18 + Math.floor(seed('disk') * 60) : null,
  };
  return { ...derived, ...DEVICE_HEALTH_OVERRIDES[device.id] };
}

export interface HealthAssessment {
  level: HealthLevel;
  /** Why it isn't healthy, most serious first. */
  reasons: string[];
}

/** Devices not seen for longer than this are flagged. */
const STALE_CHECK_IN_HOURS = 24;

export function assessHealth(device: Device, health: DeviceHealth, now: Date): HealthAssessment {
  if (device.status === 'provisioning') return { level: 'unmonitored', reasons: ['Being set up'] };
  if (device.status === 'wiping') return { level: 'unmonitored', reasons: ['Being wiped for return'] };

  const updates = health.patch.kind === 'firmware' ? 'firmware update' : 'update';
  const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
  const critical: string[] = [];
  const warning: string[] = [];

  if (device.status === 'offline') critical.push('Offline');
  if (health.patch.status === 'failed') critical.push('Patching failed');
  if (health.patch.status === 'overdue') critical.push(`${plural(health.patch.missing, updates)} overdue`);
  if (health.edr === 'missing') critical.push('No EDR agent');

  if (health.patch.status === 'pending') warning.push(`${plural(health.patch.missing, updates)} pending`);
  if (health.edr === 'outdated') warning.push('EDR agent out of date');
  if (health.encryption === 'not-encrypted') warning.push('Disk not encrypted');
  if (health.diskFreePercent !== null && health.diskFreePercent < 10) warning.push(`Low disk space (${health.diskFreePercent}% free)`);
  const hoursSinceSeen = (now.getTime() - new Date(device.lastSeen).getTime()) / 3_600_000;
  if (device.status !== 'offline' && hoursSinceSeen > STALE_CHECK_IN_HOURS) warning.push(`Not seen for ${Math.floor(hoursSinceSeen / 24)} days`);

  if (critical.length) return { level: 'critical', reasons: [...critical, ...warning] };
  if (warning.length) return { level: 'warning', reasons: warning };
  return { level: 'healthy', reasons: [] };
}

/** Share of monitored, patchable devices that are fully up to date (null when there are none). */
export function patchCompliance(entries: { device: Device; health: DeviceHealth; assessment: HealthAssessment }[]): number | null {
  const patchable = entries.filter((entry) => entry.assessment.level !== 'unmonitored' && entry.health.patch.status !== 'not-applicable');
  if (patchable.length === 0) return null;
  return patchable.filter((entry) => entry.health.patch.status === 'current').length / patchable.length;
}
