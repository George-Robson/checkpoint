import type { Acquisition } from '../types/acquisition';
import type { Alert } from '../types/alert';
import type { CatalogItem, CatalogSpec } from '../types/catalog';
import type { Device, DeviceCategory, DeviceType } from '../types/device';
import type { Kit, KitLine } from '../types/kit';
import type { LicenceAssignment, LicencePool } from '../types/licence';
import type { LicenceBundle } from '../types/licenceBundle';
import type { AccountAction, OffboardingRequest } from '../types/offboarding';
import type { Onboarding } from '../types/onboarding';
import type { Order } from '../types/order';
import type { SessionUser } from '../types/sessionUser';
import type { SoftwareProduct } from '../types/software';
import type { Tenant } from '../types/tenant';

/** Fixed "now" so lease-window and last-seen calculations are deterministic. */
export const MOCK_NOW = '2026-09-24T13:00:00Z';

export const LEASE_TERM_MONTHS = 36;

/** Manufacturer warranty on hardware bought outright; owned devices are due for refresh when it ends. */
export const WARRANTY_MONTHS = 36;

/**
 * Monthly management per managed device (monitoring, patching, imaging, warranty claims).
 * Included in lease prices; billed on its own for devices the client owns.
 */
export const DEVICE_MANAGEMENT_FEE = 5;

/** Devices whose lease or warranty ends within this many days are flagged for refresh. */
export const REFRESH_WINDOW_DAYS = 90;

/** Licensed for everyone at each client, and always included when onboarding. */
const TENANT_BASELINES: Record<string, string[]> = {
  't-acme': ['sw-m365-bp', 'sw-1password'],
  't-globex': ['sw-m365-e5', 'sw-crowdstrike', 'sw-okta'],
  't-initech': ['sw-m365-business-standard', 'sw-slack', 'sw-1password'],
  't-umbrella': ['sw-m365-bp', 'sw-defender-endpoint'],
  't-northwind': ['sw-m365-business-basic'],
  't-forgewright': ['sw-m365-e3', 'sw-crowdstrike', 'sw-1password', 'sw-slack', 'sw-jira'],
  't-lanternfly': ['sw-google-workspace', 'sw-perforce', 'sw-1password'],
};

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

export const tenants: Tenant[] = [
  {
    id: 't-acme',
    name: 'Acme Corp',
    shortCode: 'ACME',
    domain: 'acmecorp.co.uk',
    industry: 'Manufacturing',
    plan: 'Enterprise',
    primaryContact: 'Sarah Whitfield',
    region: 'North West England',
    seats: 240,
    onboardedAt: '2023-06-12',
    baselineSoftwareIds: TENANT_BASELINES['t-acme'],
    hardwarePreference: 'lease',
  },
  {
    id: 't-globex',
    name: 'Globex Solutions',
    shortCode: 'GLX',
    domain: 'globex.co.uk',
    industry: 'Financial Services',
    plan: 'Enterprise',
    primaryContact: 'James Holloway',
    region: 'London',
    seats: 410,
    onboardedAt: '2023-04-03',
    baselineSoftwareIds: TENANT_BASELINES['t-globex'],
    hardwarePreference: 'purchase',
  },
  {
    id: 't-initech',
    name: 'Initech',
    shortCode: 'INT',
    domain: 'initech.io',
    industry: 'Software',
    plan: 'Professional',
    primaryContact: 'Hannah Clarke',
    region: 'Yorkshire',
    seats: 85,
    onboardedAt: '2024-04-01',
    baselineSoftwareIds: TENANT_BASELINES['t-initech'],
    hardwarePreference: 'lease',
  },
  {
    id: 't-umbrella',
    name: 'Umbrella Health',
    shortCode: 'UMB',
    domain: 'umbrellahealth.co.uk',
    industry: 'Healthcare',
    plan: 'Professional',
    primaryContact: 'Nadia Hussain',
    region: 'South West England',
    seats: 120,
    onboardedAt: '2024-02-19',
    baselineSoftwareIds: TENANT_BASELINES['t-umbrella'],
    hardwarePreference: 'lease',
  },
  {
    id: 't-northwind',
    name: 'Northwind Logistics',
    shortCode: 'NWL',
    domain: 'northwindlogistics.co.uk',
    industry: 'Logistics & Distribution',
    plan: 'Essentials',
    primaryContact: 'Callum Fraser',
    region: 'Scotland',
    seats: 60,
    onboardedAt: '2025-09-22',
    baselineSoftwareIds: TENANT_BASELINES['t-northwind'],
    hardwarePreference: 'lease',
  },
  {
    id: 't-forgewright',
    name: 'Forgewright Interactive',
    shortCode: 'FWG',
    domain: 'forgewright.games',
    industry: 'Games · co-development & porting',
    plan: 'Professional',
    primaryContact: 'Rachel Thornton',
    region: 'Yorkshire',
    seats: 55,
    onboardedAt: '2025-11-03',
    baselineSoftwareIds: TENANT_BASELINES['t-forgewright'],
    // Capitalises its kit: publishers' audits want studio-owned, studio-managed devices.
    hardwarePreference: 'purchase',
  },
  {
    id: 't-lanternfly',
    name: 'Lanternfly Games',
    shortCode: 'LFG',
    domain: 'lanternfly.games',
    industry: 'Games · indie studio',
    plan: 'Essentials',
    primaryContact: 'Tom Ashworth',
    region: 'Yorkshire',
    seats: 7,
    onboardedAt: '2026-03-02',
    baselineSoftwareIds: TENANT_BASELINES['t-lanternfly'],
    hardwarePreference: 'lease',
  },
];

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

const CATEGORY_BY_TYPE: Record<DeviceType, DeviceCategory> = {
  'windows-laptop': 'computer',
  macbook: 'computer',
  workstation: 'computer',
  'voip-phone': 'telephony',
  smartphone: 'telephony',
  'rack-server': 'server',
  'virtual-instance': 'server',
  switch: 'networking',
  firewall: 'networking',
  'access-point': 'networking',
};

type DeviceSeed = Omit<Device, 'category' | 'termEndDate' | 'acquisition'> & { acquisition?: Acquisition };

function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function toDevice(seed: DeviceSeed): Device {
  return {
    ...seed,
    category: CATEGORY_BY_TYPE[seed.type],
    acquisition: seed.acquisition ?? 'lease',
    termEndDate: addMonths(seed.termStartDate, seed.acquisition === 'purchase' ? WARRANTY_MONTHS : LEASE_TERM_MONTHS),
  };
}

const deviceSeeds: DeviceSeed[] = [
  // --- Acme Corp (10.10.0.0/16) ---------------------------------------------
  {
    id: 'd-001', name: 'ACME-LT-0142', model: 'Dell Latitude 7450', type: 'windows-laptop',
    tenantId: 't-acme', assignedUser: 'Sarah Whitfield', status: 'active',
    ipAddress: '10.10.20.41', macAddress: 'F4:8E:38:A1:3C:52', location: 'Manchester HQ',
    termStartDate: '2024-02-12', lastSeen: '2026-09-24T12:48:00Z',
  },
  {
    id: 'd-002', name: 'ACME-LT-0157', model: 'Lenovo ThinkPad T14 Gen 4', type: 'windows-laptop',
    tenantId: 't-acme', assignedUser: 'Daniel Okafor', status: 'active',
    ipAddress: '10.10.20.58', macAddress: '98:FA:9B:4E:11:7C', location: 'Manchester HQ',
    termStartDate: '2023-11-06', lastSeen: '2026-09-24T12:51:00Z',
  },
  {
    id: 'd-003', name: 'ACME-MB-0031', model: 'MacBook Pro 14" M3 Pro', type: 'macbook',
    tenantId: 't-acme', assignedUser: 'Priya Raman', status: 'active',
    ipAddress: '10.10.20.73', macAddress: '3C:22:FB:9D:40:E1', location: 'Manchester HQ',
    termStartDate: '2024-05-20', lastSeen: '2026-09-24T12:32:00Z',
  },
  {
    id: 'd-004', name: 'ACME-LT-0163', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-acme', assignedUser: 'Tom Brennan', status: 'provisioning',
    ipAddress: null, macAddress: '98:FA:9B:52:07:19', location: 'Sheffield Warehouse',
    termStartDate: '2026-09-22', lastSeen: '2026-09-23T16:05:00Z',
  },
  {
    id: 'd-005', name: 'ACME-PH-2201', model: 'Poly Edge E350', type: 'voip-phone',
    tenantId: 't-acme', assignedUser: 'Sarah Whitfield', status: 'active',
    ipAddress: '10.10.40.12', macAddress: '64:16:7F:2A:9C:03', location: 'Manchester HQ',
    termStartDate: '2024-02-12', lastSeen: '2026-09-24T12:55:00Z',
  },
  {
    id: 'd-006', name: 'ACME-PH-2202', model: 'Poly Edge E350', type: 'voip-phone',
    tenantId: 't-acme', assignedUser: 'Daniel Okafor', status: 'active',
    ipAddress: '10.10.40.13', macAddress: '64:16:7F:2A:9C:0B', location: 'Manchester HQ',
    termStartDate: '2023-10-02', lastSeen: '2026-09-24T12:55:00Z',
  },
  {
    id: 'd-007', name: 'ACME-MOB-0088', model: 'iPhone 15', type: 'smartphone',
    tenantId: 't-acme', assignedUser: 'Priya Raman', status: 'active',
    ipAddress: '10.10.60.44', macAddress: 'F2:6B:3A:19:C4:07', location: 'Manchester HQ',
    termStartDate: '2024-06-03', lastSeen: '2026-09-24T12:40:00Z',
  },
  {
    id: 'd-008', name: 'ACME-SRV-01', model: 'Dell PowerEdge R760', type: 'rack-server',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.1.10', macAddress: 'B0:7B:25:3E:8A:10', location: 'Manchester HQ · Comms Room',
    termStartDate: '2024-01-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-009', name: 'ACME-SRV-02', model: 'Dell PowerEdge R650', type: 'rack-server',
    tenantId: 't-acme', assignedUser: null, status: 'offline',
    ipAddress: '10.10.1.11', macAddress: 'B0:7B:25:3E:8A:2C', location: 'Manchester HQ · Comms Room',
    termStartDate: '2023-12-04', lastSeen: '2026-09-24T03:17:00Z',
  },
  {
    id: 'd-010', name: 'ACME-VM-SQL01', model: 'Azure D8s v5', type: 'virtual-instance',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.100.21', macAddress: '00:0D:3A:6F:21:B8', location: 'Azure UK South',
    termStartDate: '2025-03-01', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-011', name: 'ACME-FW-01', model: 'Fortinet FortiGate 100F', type: 'firewall',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.0.1', macAddress: '00:09:0F:FE:21:A4', location: 'Manchester HQ · Comms Room',
    termStartDate: '2024-01-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-012', name: 'ACME-SW-01', model: 'Cisco Meraki MS250-48', type: 'switch',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.0.2', macAddress: '0C:8D:DB:6A:10:F2', location: 'Manchester HQ · Comms Room',
    termStartDate: '2024-01-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-013', name: 'ACME-AP-03', model: 'Cisco Meraki MR46', type: 'access-point',
    tenantId: 't-acme', assignedUser: null, status: 'offline',
    ipAddress: '10.10.0.23', macAddress: '0C:8D:DB:71:3E:05', location: 'Sheffield Warehouse',
    termStartDate: '2024-08-19', lastSeen: '2026-09-22T21:40:00Z',
  },

  // --- Globex Solutions (10.20.0.0/16) --------------------------------------
  {
    id: 'd-014', name: 'GLX-LT-0301', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-globex', assignedUser: 'James Holloway', status: 'active',
    ipAddress: '10.20.10.31', macAddress: '98:FA:9B:61:A2:3D', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2025-01-13', lastSeen: '2026-09-24T12:57:00Z',
  },
  {
    id: 'd-015', name: 'GLX-LT-0302', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-globex', assignedUser: 'Amara Nwosu', status: 'active',
    ipAddress: '10.20.10.32', macAddress: '98:FA:9B:61:A2:9F', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2026-08-28', lastSeen: '2026-09-24T12:44:00Z',
  },
  {
    id: 'd-016', name: 'GLX-MB-0112', model: 'MacBook Air 13" M2', type: 'macbook',
    tenantId: 't-globex', assignedUser: 'Chloe Bennett', status: 'wiping',
    ipAddress: null, macAddress: '3C:22:FB:14:6E:D0', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2023-09-04', lastSeen: '2026-09-24T11:20:00Z',
  },
  {
    id: 'd-017', name: 'GLX-MB-0118', model: 'MacBook Pro 16" M4 Pro', type: 'macbook',
    tenantId: 't-globex', assignedUser: 'Oliver Grant', status: 'provisioning',
    ipAddress: null, macAddress: '3C:22:FB:88:02:4A', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2026-09-19', lastSeen: '2026-09-24T09:14:00Z',
  },
  {
    id: 'd-018', name: 'GLX-PH-3104', model: 'Yealink T54W', type: 'voip-phone',
    tenantId: 't-globex', assignedUser: 'James Holloway', status: 'active',
    ipAddress: '10.20.40.104', macAddress: '80:5E:C0:3B:71:0E', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2025-01-13', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-019', name: 'GLX-PH-3105', model: 'Yealink T54W', type: 'voip-phone',
    tenantId: 't-globex', assignedUser: 'Amara Nwosu', status: 'active',
    ipAddress: '10.20.40.105', macAddress: '80:5E:C0:3B:71:1A', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2026-08-28', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-020', name: 'GLX-MOB-0204', model: 'iPhone 16 Pro', type: 'smartphone',
    tenantId: 't-globex', assignedUser: 'Oliver Grant', status: 'provisioning',
    ipAddress: null, macAddress: 'A6:1D:4F:90:3C:E2', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2026-09-19', lastSeen: '2026-09-24T09:10:00Z',
  },
  {
    id: 'd-021', name: 'GLX-MOB-0197', model: 'iPhone 13', type: 'smartphone',
    tenantId: 't-globex', assignedUser: 'Chloe Bennett', status: 'wiping',
    ipAddress: null, macAddress: 'DA:47:0B:2E:95:61', location: 'London HQ',
    acquisition: 'purchase', termStartDate: '2023-09-04', lastSeen: '2026-09-24T11:22:00Z',
  },
  {
    id: 'd-022', name: 'GLX-SRV-01', model: 'HPE ProLiant DL380 Gen11', type: 'rack-server',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.1.10', macAddress: '94:40:C9:5D:17:B3', location: 'London HQ · Server Room',
    acquisition: 'purchase', termStartDate: '2024-07-01', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-023', name: 'GLX-VM-APP02', model: 'AWS EC2 m6i.xlarge', type: 'virtual-instance',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.100.32', macAddress: '0A:3F:9C:12:7B:44', location: 'AWS eu-west-2',
    termStartDate: '2025-06-16', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-024', name: 'GLX-FW-01', model: 'Palo Alto PA-440', type: 'firewall',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.0.1', macAddress: 'B4:0C:25:E0:4F:18', location: 'London HQ · Server Room',
    acquisition: 'purchase', termStartDate: '2024-07-01', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-025', name: 'GLX-AP-07', model: 'Cisco Meraki MR56', type: 'access-point',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.0.27', macAddress: '0C:8D:DB:92:6C:31', location: 'Birmingham Office',
    acquisition: 'purchase', termStartDate: '2023-11-27', lastSeen: '2026-09-24T12:59:00Z',
  },

  // --- Initech (172.16.0.0/16) ----------------------------------------------
  {
    id: 'd-026', name: 'INT-WS-0012', model: 'Dell Precision 3680 Tower', type: 'workstation',
    tenantId: 't-initech', assignedUser: 'Ravi Patel', status: 'active',
    ipAddress: '172.16.10.12', macAddress: 'F4:8E:38:C7:5A:21', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2024-09-09', lastSeen: '2026-09-24T12:46:00Z',
  },
  {
    id: 'd-027', name: 'INT-WS-0015', model: 'Dell Precision 3680 Tower', type: 'workstation',
    tenantId: 't-initech', assignedUser: 'Grace Liu', status: 'active',
    ipAddress: '172.16.10.15', macAddress: 'F4:8E:38:C7:5A:6E', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2023-10-16', lastSeen: '2026-09-24T12:50:00Z',
  },
  {
    id: 'd-028', name: 'INT-MB-0044', model: 'MacBook Pro 16" M4 Max', type: 'macbook',
    tenantId: 't-initech', assignedUser: 'Ethan Walsh', status: 'active',
    ipAddress: '172.16.10.44', macAddress: '3C:22:FB:A3:19:5C', location: 'Leeds Studio',
    termStartDate: '2025-02-03', lastSeen: '2026-09-24T12:37:00Z',
  },
  {
    id: 'd-029', name: 'INT-WS-0019', model: 'Dell Precision 5690', type: 'workstation',
    tenantId: 't-initech', assignedUser: 'Lucy Morgan', status: 'provisioning',
    ipAddress: null, macAddress: 'F4:8E:38:D1:08:93', location: 'Leeds Studio',
    termStartDate: '2026-09-21', lastSeen: '2026-09-24T08:30:00Z',
  },
  {
    id: 'd-030', name: 'INT-LT-0021', model: 'HP EliteBook 840 G11', type: 'windows-laptop',
    tenantId: 't-initech', assignedUser: 'Hannah Clarke', status: 'active',
    ipAddress: '172.16.10.21', macAddress: '5C:60:BA:2F:44:D7', location: 'Leeds Studio',
    termStartDate: '2024-04-15', lastSeen: '2026-09-24T12:53:00Z',
  },
  {
    id: 'd-031', name: 'INT-PH-0405', model: 'Poly CCX 400', type: 'voip-phone',
    tenantId: 't-initech', assignedUser: 'Hannah Clarke', status: 'active',
    ipAddress: '172.16.40.5', macAddress: '64:16:7F:4C:12:A8', location: 'Leeds Studio',
    termStartDate: '2024-04-15', lastSeen: '2026-09-24T12:53:00Z',
  },
  {
    id: 'd-032', name: 'INT-VM-CI01', model: 'Azure D16s v5', type: 'virtual-instance',
    tenantId: 't-initech', assignedUser: null, status: 'active',
    ipAddress: '172.16.100.11', macAddress: '00:0D:3A:B4:5E:02', location: 'Azure UK South',
    termStartDate: '2025-08-04', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-033', name: 'INT-FW-01', model: 'Fortinet FortiGate 60F', type: 'firewall',
    tenantId: 't-initech', assignedUser: null, status: 'active',
    ipAddress: '172.16.0.1', macAddress: '00:09:0F:AA:81:3D', location: 'Leeds Studio · Comms Cabinet',
    termStartDate: '2024-04-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-034', name: 'INT-SW-01', model: 'Cisco Meraki MS130-24P', type: 'switch',
    tenantId: 't-initech', assignedUser: null, status: 'active',
    ipAddress: '172.16.0.2', macAddress: '0C:8D:DB:A5:33:7E', location: 'Leeds Studio · Comms Cabinet',
    termStartDate: '2024-04-15', lastSeen: '2026-09-24T12:59:00Z',
  },

  // --- Umbrella Health (10.40.0.0/16) ---------------------------------------
  {
    id: 'd-035', name: 'UMB-LT-0510', model: 'Dell Latitude 5450', type: 'windows-laptop',
    tenantId: 't-umbrella', assignedUser: 'Dr. Emily Shaw', status: 'active',
    ipAddress: '10.40.20.50', macAddress: 'F4:8E:38:E2:6B:14', location: 'Bristol Clinic',
    termStartDate: '2025-05-12', lastSeen: '2026-09-24T12:42:00Z',
  },
  {
    id: 'd-036', name: 'UMB-LT-0511', model: 'Dell Latitude 5450', type: 'windows-laptop',
    tenantId: 't-umbrella', assignedUser: 'Marcus Reid', status: 'offline',
    ipAddress: '10.40.20.51', macAddress: 'F4:8E:38:E2:6B:3A', location: 'Bristol Clinic',
    termStartDate: '2025-05-12', lastSeen: '2026-09-19T17:26:00Z',
  },
  {
    id: 'd-037', name: 'UMB-LT-0498', model: 'Dell Latitude 5440', type: 'windows-laptop',
    tenantId: 't-umbrella', assignedUser: 'Nadia Hussain', status: 'active',
    ipAddress: '10.40.20.38', macAddress: 'F4:8E:38:9A:10:C5', location: 'Bristol Clinic',
    termStartDate: '2023-12-11', lastSeen: '2026-09-24T12:39:00Z',
  },
  {
    id: 'd-038', name: 'UMB-PH-0620', model: 'Yealink T46U', type: 'voip-phone',
    tenantId: 't-umbrella', assignedUser: null, status: 'active',
    ipAddress: '10.40.40.20', macAddress: '80:5E:C0:7D:22:9B', location: 'Bristol Clinic · Reception',
    termStartDate: '2024-03-04', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-039', name: 'UMB-MOB-0302', model: 'iPhone 15', type: 'smartphone',
    tenantId: 't-umbrella', assignedUser: 'Dr. Emily Shaw', status: 'active',
    ipAddress: '10.40.60.12', macAddress: 'C6:91:5A:0E:7F:33', location: 'Bristol Clinic',
    termStartDate: '2025-05-12', lastSeen: '2026-09-24T12:15:00Z',
  },
  {
    id: 'd-040', name: 'UMB-SRV-01', model: 'Lenovo ThinkSystem SR650 V3', type: 'rack-server',
    tenantId: 't-umbrella', assignedUser: null, status: 'active',
    ipAddress: '10.40.1.10', macAddress: '08:3A:88:5B:C0:71', location: 'Bristol Clinic · Server Room',
    termStartDate: '2024-03-04', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-041', name: 'UMB-FW-01', model: 'Fortinet FortiGate 100F', type: 'firewall',
    tenantId: 't-umbrella', assignedUser: null, status: 'active',
    ipAddress: '10.40.0.1', macAddress: '00:09:0F:BC:47:E9', location: 'Bristol Clinic · Server Room',
    termStartDate: '2024-03-04', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-042', name: 'UMB-AP-02', model: 'Cisco Meraki MR36', type: 'access-point',
    tenantId: 't-umbrella', assignedUser: null, status: 'provisioning',
    ipAddress: null, macAddress: '0C:8D:DB:B8:0D:52', location: 'Bath Clinic',
    termStartDate: '2026-09-20', lastSeen: '2026-09-20T14:02:00Z',
  },

  // --- Northwind Logistics (192.168.0.0/16) ---------------------------------
  {
    id: 'd-043', name: 'NWL-LT-0071', model: 'Lenovo ThinkPad E14 Gen 6', type: 'windows-laptop',
    tenantId: 't-northwind', assignedUser: 'Callum Fraser', status: 'active',
    ipAddress: '192.168.10.71', macAddress: '98:FA:9B:77:E1:08', location: 'Edinburgh Depot',
    termStartDate: '2025-10-06', lastSeen: '2026-09-24T12:30:00Z',
  },
  {
    id: 'd-044', name: 'NWL-LT-0074', model: 'Lenovo ThinkPad E14 Gen 5', type: 'windows-laptop',
    tenantId: 't-northwind', assignedUser: 'Isla Robertson', status: 'active',
    ipAddress: '192.168.10.74', macAddress: '98:FA:9B:3C:5D:B2', location: 'Edinburgh Depot',
    termStartDate: '2023-10-23', lastSeen: '2026-09-24T12:21:00Z',
  },
  {
    id: 'd-045', name: 'NWL-MOB-0130', model: 'Samsung Galaxy XCover7', type: 'smartphone',
    tenantId: 't-northwind', assignedUser: 'Callum Fraser', status: 'active',
    ipAddress: '192.168.60.30', macAddress: '5E:B2:18:C9:04:7A', location: 'Edinburgh Depot',
    termStartDate: '2025-10-06', lastSeen: '2026-09-24T11:58:00Z',
  },
  {
    id: 'd-046', name: 'NWL-MOB-0131', model: 'Samsung Galaxy XCover7', type: 'smartphone',
    tenantId: 't-northwind', assignedUser: 'Jamie Stewart', status: 'offline',
    ipAddress: '192.168.60.31', macAddress: '5E:B2:18:C9:04:9F', location: 'Glasgow Depot',
    termStartDate: '2026-09-12', lastSeen: '2026-09-23T18:44:00Z',
  },
  {
    id: 'd-047', name: 'NWL-SW-01', model: 'Cisco Meraki MS120-24', type: 'switch',
    tenantId: 't-northwind', assignedUser: null, status: 'offline',
    ipAddress: '192.168.20.2', macAddress: '0C:8D:DB:C4:19:E6', location: 'Glasgow Depot',
    termStartDate: '2025-10-06', lastSeen: '2026-09-24T06:42:00Z',
  },
  {
    id: 'd-048', name: 'NWL-FW-01', model: 'Cisco Meraki MX68', type: 'firewall',
    tenantId: 't-northwind', assignedUser: null, status: 'active',
    ipAddress: '192.168.10.1', macAddress: '0C:8D:DB:C4:02:11', location: 'Edinburgh Depot',
    termStartDate: '2025-10-06', lastSeen: '2026-09-24T12:59:00Z',
  },

  // --- Forgewright Interactive (10.60.0.0/16) · co-development studio, Leeds --------
  {
    id: 'd-049', name: 'FWG-WS-0201', model: 'HP Z4 G5 Workstation', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Priyanka Shah', status: 'active',
    ipAddress: '10.60.20.21', macAddress: 'B0:22:7A:41:0C:18', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2025-11-17', lastSeen: '2026-09-24T12:55:00Z',
  },
  {
    id: 'd-050', name: 'FWG-WS-0202', model: 'HP Z4 G5 Workstation', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Ben Hartley', status: 'active',
    ipAddress: '10.60.20.22', macAddress: 'B0:22:7A:41:0C:3E', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2025-11-17', lastSeen: '2026-09-24T12:41:00Z',
  },
  {
    id: 'd-051', name: 'FWG-WS-0214', model: 'Lenovo ThinkStation P3 Tower', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Sofia Marin', status: 'active',
    ipAddress: '10.60.20.34', macAddress: '6C:24:08:9A:52:11', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2025-11-17', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-052', name: 'FWG-WS-0215', model: 'Lenovo ThinkStation P3 Tower', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Arjun Mehta', status: 'active',
    ipAddress: '10.60.20.35', macAddress: '6C:24:08:9A:52:7D', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2026-02-09', lastSeen: '2026-09-24T12:50:00Z',
  },
  {
    id: 'd-053', name: 'FWG-WS-0216', model: 'Lenovo ThinkStation P3 Tower', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Kasia Nowak', status: 'active',
    ipAddress: '10.60.20.36', macAddress: '6C:24:08:9A:53:02', location: 'Remote',
    acquisition: 'purchase', termStartDate: '2026-02-09', lastSeen: '2026-09-24T12:37:00Z',
  },
  {
    id: 'd-054', name: 'FWG-LT-0031', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-forgewright', assignedUser: 'Rachel Thornton', status: 'active',
    ipAddress: '10.60.30.11', macAddress: '98:FA:9B:62:0D:A4', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2025-11-17', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-055', name: 'FWG-WS-0230', model: 'Dell Precision 3680 Tower', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Hollie Grant', status: 'active',
    ipAddress: '10.60.40.12', macAddress: 'F4:8E:38:C2:77:10', location: 'Leeds Studio · QA Lab',
    acquisition: 'purchase', termStartDate: '2025-12-01', lastSeen: '2026-09-24T12:46:00Z',
  },
  {
    id: 'd-056', name: 'FWG-MB-0007', model: 'MacBook Pro 16" M4 Pro', type: 'macbook',
    tenantId: 't-forgewright', assignedUser: 'Dan Whitaker', status: 'active',
    ipAddress: '10.60.30.18', macAddress: '3C:22:FB:90:1E:6B', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2026-01-12', lastSeen: '2026-09-24T12:22:00Z',
  },
  {
    id: 'd-057', name: 'FWG-SRV-01', model: 'Synology RackStation RS2423RP+', type: 'rack-server',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.60.1.10', macAddress: '00:11:32:C4:8A:21', location: 'Leeds Studio · Server Room',
    acquisition: 'purchase', termStartDate: '2025-11-10', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-058', name: 'FWG-SRV-02', model: 'Dell PowerEdge R760', type: 'rack-server',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.60.1.11', macAddress: 'B0:7B:25:3F:90:C2', location: 'Leeds Studio · Server Room',
    acquisition: 'purchase', termStartDate: '2025-11-10', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-059', name: 'FWG-VM-BUILD01', model: 'Azure D16s v5', type: 'virtual-instance',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.61.0.4', macAddress: '00:0D:3A:6B:21:C8', location: 'Azure UK South',
    termStartDate: '2026-03-02', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-060', name: 'FWG-FW-01', model: 'Fortinet FortiGate 100F', type: 'firewall',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.60.0.1', macAddress: '70:4C:A5:3A:18:9E', location: 'Leeds Studio · Server Room',
    acquisition: 'purchase', termStartDate: '2025-11-10', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-061', name: 'FWG-SW-01', model: 'Cisco Meraki MS250-48', type: 'switch',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.60.0.2', macAddress: '0C:8D:DB:71:2A:05', location: 'Leeds Studio · Server Room',
    acquisition: 'purchase', termStartDate: '2025-11-10', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-062', name: 'FWG-SW-02', model: 'Cisco Meraki MS130-24P', type: 'switch',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.60.90.2', macAddress: '0C:8D:DB:71:3B:44', location: 'Leeds Studio · Devkit Lab',
    acquisition: 'purchase', termStartDate: '2025-11-10', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-063', name: 'FWG-AP-01', model: 'Cisco Meraki MR36', type: 'access-point',
    tenantId: 't-forgewright', assignedUser: null, status: 'active',
    ipAddress: '10.60.0.21', macAddress: '0C:8D:DB:88:14:2F', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2025-11-10', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-064', name: 'FWG-WS-0220', model: 'HP Z4 G5 Workstation', type: 'workstation',
    tenantId: 't-forgewright', assignedUser: 'Eleanor Hughes', status: 'provisioning',
    ipAddress: null, macAddress: 'B0:22:7A:41:0D:52', location: 'Leeds Studio',
    acquisition: 'purchase', termStartDate: '2026-09-22', lastSeen: '2026-09-24T09:05:00Z',
  },

  // --- Lanternfly Games (192.168.40.0/24) · indie studio, Sheffield -----------------
  {
    id: 'd-065', name: 'LFG-WS-0001', model: 'Lenovo ThinkStation P3 Tower', type: 'workstation',
    tenantId: 't-lanternfly', assignedUser: 'Tom Ashworth', status: 'active',
    ipAddress: '192.168.40.11', macAddress: '6C:24:08:A1:04:90', location: 'Kelham Island Studio',
    termStartDate: '2026-03-09', lastSeen: '2026-09-24T12:57:00Z',
  },
  {
    id: 'd-066', name: 'LFG-WS-0002', model: 'HP Z4 G5 Workstation', type: 'workstation',
    tenantId: 't-lanternfly', assignedUser: 'Mia Chen', status: 'active',
    ipAddress: '192.168.40.12', macAddress: 'B0:22:7A:52:9C:0E', location: 'Kelham Island Studio',
    termStartDate: '2026-03-09', lastSeen: '2026-09-24T12:44:00Z',
  },
  {
    id: 'd-067', name: 'LFG-LT-0003', model: 'Lenovo ThinkPad E14 Gen 6', type: 'windows-laptop',
    tenantId: 't-lanternfly', assignedUser: 'Jas Kaur', status: 'active',
    ipAddress: '192.168.40.21', macAddress: '98:FA:9B:77:31:5C', location: 'Remote',
    termStartDate: '2026-03-09', lastSeen: '2026-09-24T11:48:00Z',
  },
  {
    id: 'd-068', name: 'LFG-MB-0004', model: 'MacBook Air 13" M3', type: 'macbook',
    tenantId: 't-lanternfly', assignedUser: 'Leo Barnes', status: 'active',
    ipAddress: '192.168.40.22', macAddress: '3C:22:FB:A4:62:0D', location: 'Kelham Island Studio',
    termStartDate: '2026-04-06', lastSeen: '2026-09-24T12:31:00Z',
  },
  {
    id: 'd-069', name: 'LFG-SRV-01', model: 'Synology RackStation RS2423RP+', type: 'rack-server',
    tenantId: 't-lanternfly', assignedUser: null, status: 'active',
    ipAddress: '192.168.40.5', macAddress: '00:11:32:D2:7F:14', location: 'Kelham Island Studio',
    termStartDate: '2026-03-09', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-070', name: 'LFG-FW-01', model: 'Cisco Meraki MX68', type: 'firewall',
    tenantId: 't-lanternfly', assignedUser: null, status: 'active',
    ipAddress: '192.168.40.1', macAddress: '0C:8D:DB:92:40:1B', location: 'Kelham Island Studio',
    termStartDate: '2026-03-09', lastSeen: '2026-09-24T12:59:00Z',
  },
];

export const devices: Device[] = deviceSeeds.map(toDevice);

// ---------------------------------------------------------------------------
// Catalogue (everything a kit can contain; prices are per month)
// ---------------------------------------------------------------------------

function spec(label: string, value: string): CatalogSpec {
  return { label, value };
}

export const catalogItems: CatalogItem[] = [
  // --- Hardware: computers --------------------------------------------------
  {
    id: 'hw-precision-5690', kind: 'hardware', deviceType: 'workstation', vendor: 'Dell',
    name: 'Dell Precision 5690', detail: '16" mobile workstation', monthlyPrice: 98, purchasePrice: 3450,
    image: '/catalog/photos/hw-precision-5690.webp',
    specs: [
      spec('Processor', 'Intel Core Ultra 9 185H'),
      spec('Memory', '64 GB LPDDR5x'),
      spec('Storage', '2 TB NVMe SSD'),
      spec('Graphics', 'NVIDIA RTX 3500 Ada, 12 GB'),
      spec('Display', '16" UHD+ OLED touch'),
      spec('Weight', '2.3 kg'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },
  {
    id: 'hw-precision-3680', kind: 'hardware', deviceType: 'workstation', vendor: 'Dell',
    name: 'Dell Precision 3680 Tower', detail: 'Tower workstation · monitors not included', monthlyPrice: 84, purchasePrice: 2890,
    image: '/catalog/photos/hw-precision-3680.webp',
    specs: [
      spec('Processor', 'Intel Core i9-14900K'),
      spec('Memory', '64 GB DDR5'),
      spec('Storage', '2 TB NVMe SSD'),
      spec('Graphics', 'NVIDIA RTX 4000 Ada, 20 GB'),
      spec('Ports', 'Thunderbolt 4, 2× DisplayPort 1.4'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },
  {
    id: 'hw-optiplex-7020', kind: 'hardware', deviceType: 'workstation', vendor: 'Dell',
    name: 'Dell OptiPlex 7020 Micro', detail: 'Ultra-compact desktop · monitor not included', monthlyPrice: 26, purchasePrice: 749,
    image: '/catalog/photos/hw-optiplex-7020.webp',
    specs: [
      spec('Processor', 'Intel Core i5-14500T'),
      spec('Memory', '16 GB DDR5'),
      spec('Storage', '512 GB NVMe SSD'),
      spec('Graphics', 'Intel UHD 770'),
      spec('Mounting', 'VESA bracket behind the monitor'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },
  {
    id: 'hw-mbp16-m4-max', kind: 'hardware', deviceType: 'macbook', vendor: 'Apple',
    name: 'MacBook Pro 16" M4 Max', detail: '16" pro laptop', monthlyPrice: 132, purchasePrice: 3999,
    image: '/catalog/photos/hw-mbp16-m4-max.webp',
    specs: [
      spec('Chip', 'Apple M4 Max · 16-core CPU, 40-core GPU'),
      spec('Memory', '64 GB unified'),
      spec('Storage', '2 TB SSD'),
      spec('Display', '16.2" Liquid Retina XDR'),
      spec('Battery', 'Up to 21 hours'),
      spec('Weight', '2.15 kg'),
      spec('OS', 'macOS Sequoia'),
    ],
  },
  {
    id: 'hw-mbp16-m4-pro', kind: 'hardware', deviceType: 'macbook', vendor: 'Apple',
    name: 'MacBook Pro 16" M4 Pro', detail: '16" pro laptop', monthlyPrice: 104, purchasePrice: 2799,
    image: '/catalog/photos/hw-mbp16-m4-pro.webp',
    specs: [
      spec('Chip', 'Apple M4 Pro · 14-core CPU, 20-core GPU'),
      spec('Memory', '48 GB unified'),
      spec('Storage', '1 TB SSD'),
      spec('Display', '16.2" Liquid Retina XDR'),
      spec('Battery', 'Up to 24 hours'),
      spec('Weight', '2.14 kg'),
      spec('OS', 'macOS Sequoia'),
    ],
  },
  {
    id: 'hw-mba13-m3', kind: 'hardware', deviceType: 'macbook', vendor: 'Apple',
    name: 'MacBook Air 13" M3', detail: '13" everyday laptop', monthlyPrice: 44, purchasePrice: 999,
    image: '/catalog/photos/hw-mba13-m3.webp',
    specs: [
      spec('Chip', 'Apple M3 · 8-core CPU, 10-core GPU'),
      spec('Memory', '16 GB unified'),
      spec('Storage', '512 GB SSD'),
      spec('Display', '13.6" Liquid Retina'),
      spec('Battery', 'Up to 18 hours'),
      spec('Weight', '1.24 kg'),
      spec('OS', 'macOS Sequoia'),
    ],
  },
  {
    id: 'hw-x1-carbon-g12', kind: 'hardware', deviceType: 'windows-laptop', vendor: 'Lenovo',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12', detail: '14" ultraportable laptop', monthlyPrice: 62, purchasePrice: 1899,
    image: '/catalog/photos/hw-x1-carbon-g12.webp',
    specs: [
      spec('Processor', 'Intel Core Ultra 7 155U'),
      spec('Memory', '32 GB LPDDR5x'),
      spec('Storage', '1 TB NVMe SSD'),
      spec('Display', '14" 2.8K OLED'),
      spec('Connectivity', '5G WWAN, Wi-Fi 7'),
      spec('Weight', '1.09 kg'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },
  {
    id: 'hw-latitude-5450', kind: 'hardware', deviceType: 'windows-laptop', vendor: 'Dell',
    name: 'Dell Latitude 5450', detail: '14" business laptop', monthlyPrice: 36, purchasePrice: 1049,
    image: '/catalog/photos/hw-latitude-5450.webp',
    specs: [
      spec('Processor', 'Intel Core Ultra 5 125U'),
      spec('Memory', '16 GB DDR5'),
      spec('Storage', '512 GB NVMe SSD'),
      spec('Display', '14" FHD+ anti-glare'),
      spec('Weight', '1.35 kg'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },
  {
    id: 'hw-thinkpad-e14-g6', kind: 'hardware', deviceType: 'windows-laptop', vendor: 'Lenovo',
    name: 'Lenovo ThinkPad E14 Gen 6', detail: '14" essentials laptop', monthlyPrice: 29, purchasePrice: 799,
    image: '/catalog/photos/hw-thinkpad-e14-g6.webp',
    specs: [
      spec('Processor', 'AMD Ryzen 5 7535HS'),
      spec('Memory', '16 GB DDR5'),
      spec('Storage', '512 GB NVMe SSD'),
      spec('Display', '14" WUXGA IPS'),
      spec('Weight', '1.44 kg'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },

  // --- Hardware: telephony --------------------------------------------------
  {
    id: 'hw-poly-edge-e350', kind: 'hardware', deviceType: 'voip-phone', vendor: 'Poly',
    name: 'Poly Edge E350', detail: 'VoIP desk phone · auto-provisioned extension', monthlyPrice: 9, purchasePrice: 239,
    image: '/catalog/photos/hw-poly-edge-e350.webp',
    specs: [
      spec('Display', '3.5" colour'),
      spec('Lines', '8'),
      spec('Audio', 'HD Voice with Acoustic Fence'),
      spec('Connectivity', 'Dual Gigabit Ethernet, Bluetooth'),
      spec('Power', 'PoE'),
    ],
  },
  {
    id: 'hw-yealink-t54w', kind: 'hardware', deviceType: 'voip-phone', vendor: 'Yealink',
    name: 'Yealink T54W', detail: 'VoIP desk phone · auto-provisioned extension', monthlyPrice: 8, purchasePrice: 199,
    image: '/catalog/photos/hw-yealink-t54w.webp',
    specs: [
      spec('Display', '4.3" colour, adjustable'),
      spec('Lines', '16'),
      spec('Audio', 'HD Voice, noise-proof'),
      spec('Connectivity', 'Gigabit Ethernet, Wi-Fi, Bluetooth'),
      spec('Power', 'PoE'),
    ],
  },
  {
    id: 'hw-iphone-16-pro', kind: 'hardware', deviceType: 'smartphone', vendor: 'Apple',
    name: 'iPhone 16 Pro', detail: 'Smartphone · supervised via Apple Business Manager', monthlyPrice: 46, purchasePrice: 999,
    image: '/catalog/photos/hw-iphone-16-pro.webp',
    specs: [
      spec('Chip', 'A18 Pro'),
      spec('Storage', '256 GB'),
      spec('Display', '6.3" Super Retina XDR'),
      spec('Connectivity', '5G, eSIM'),
      spec('Battery', 'Up to 27 hours video'),
    ],
  },
  {
    id: 'hw-iphone-15', kind: 'hardware', deviceType: 'smartphone', vendor: 'Apple',
    name: 'iPhone 15', detail: 'Smartphone · supervised via Apple Business Manager', monthlyPrice: 28, purchasePrice: 599,
    image: '/catalog/photos/hw-iphone-15.webp',
    specs: [
      spec('Chip', 'A16 Bionic'),
      spec('Storage', '128 GB'),
      spec('Display', '6.1" Super Retina XDR'),
      spec('Connectivity', '5G, eSIM'),
      spec('Battery', 'Up to 20 hours video'),
    ],
  },
  {
    id: 'hw-galaxy-xcover7', kind: 'hardware', deviceType: 'smartphone', vendor: 'Samsung',
    name: 'Samsung Galaxy XCover7', detail: 'Rugged smartphone · Android Enterprise', monthlyPrice: 21, purchasePrice: 399,
    image: '/catalog/photos/hw-galaxy-xcover7.webp',
    specs: [
      spec('Storage', '128 GB'),
      spec('Display', '6.6" FHD+, glove mode'),
      spec('Durability', 'IP68, MIL-STD-810H'),
      spec('Battery', 'Replaceable 4,050 mAh'),
      spec('Connectivity', '5G, dual SIM'),
    ],
  },
  {
    id: 'hw-zebra-tc58', kind: 'hardware', deviceType: 'smartphone', vendor: 'Zebra',
    name: 'Zebra TC58 handheld', detail: 'Rugged mobile computer · Android Enterprise', monthlyPrice: 38, purchasePrice: 1249,
    image: '/catalog/photos/hw-zebra-tc58.webp',
    specs: [
      spec('Scanner', 'SE55 1D/2D imager, up to 21 m'),
      spec('Storage', '128 GB'),
      spec('Display', '6" FHD+, wet and glove touch'),
      spec('Durability', 'IP68, 1.8 m drops to concrete'),
      spec('Battery', 'Hot-swappable 5,000 mAh'),
    ],
  },

  // --- Hardware: networking -------------------------------------------------
  {
    id: 'hw-meraki-mx68', kind: 'hardware', deviceType: 'firewall', vendor: 'Cisco Meraki',
    name: 'Cisco Meraki MX68', detail: 'Cloud-managed firewall and SD-WAN', monthlyPrice: 58, purchasePrice: 1650,
    image: '/catalog/photos/hw-meraki-mx68.webp',
    specs: [
      spec('Throughput', '450 Mbps firewall · 200 Mbps VPN'),
      spec('Ports', '12× GbE (2 PoE+)'),
      spec('Recommended for', 'Up to 50 users'),
      spec('Licence', 'Advanced Security'),
    ],
  },
  {
    id: 'hw-fortigate-60f', kind: 'hardware', deviceType: 'firewall', vendor: 'Fortinet',
    name: 'Fortinet FortiGate 60F', detail: 'Next-generation firewall', monthlyPrice: 49, purchasePrice: 1190,
    image: '/catalog/photos/hw-fortigate-60f.webp',
    specs: [
      spec('Throughput', '10 Gbps firewall · 700 Mbps threat protection'),
      spec('Ports', '10× GbE'),
      spec('Recommended for', 'Up to 100 users'),
      spec('Licence', 'Unified Threat Protection'),
    ],
  },
  {
    id: 'hw-meraki-ms130-24p', kind: 'hardware', deviceType: 'switch', vendor: 'Cisco Meraki',
    name: 'Cisco Meraki MS130-24P', detail: 'Cloud-managed access switch', monthlyPrice: 42, purchasePrice: 1290,
    image: '/catalog/photos/hw-meraki-ms130-24p.webp',
    specs: [
      spec('Ports', '24× GbE + 4× 1G SFP uplinks'),
      spec('PoE budget', '370 W PoE+'),
      spec('Form factor', '1U rack mount'),
      spec('Management', 'Meraki Dashboard'),
    ],
  },
  {
    id: 'hw-meraki-mr36', kind: 'hardware', deviceType: 'access-point', vendor: 'Cisco Meraki',
    name: 'Cisco Meraki MR36', detail: 'Indoor Wi-Fi 6 access point', monthlyPrice: 16, purchasePrice: 480,
    image: '/catalog/photos/hw-meraki-mr36.webp',
    specs: [
      spec('Wi-Fi', 'Wi-Fi 6 (802.11ax), 2×2 MU-MIMO'),
      spec('Speed', 'Up to 1.7 Gbps'),
      spec('Coverage', 'Approx. 250 m² indoors'),
      spec('Power', 'PoE (802.3af)'),
    ],
  },

  // --- Peripherals ----------------------------------------------------------
  {
    id: 'pe-u2724de', kind: 'peripheral', vendor: 'Dell',
    name: 'Dell UltraSharp U2724DE', detail: '27" QHD · USB-C hub · 90 W charging', monthlyPrice: 9, purchasePrice: 459,
    image: '/catalog/photos/pe-u2724de.webp',
  },
  {
    id: 'pe-p2425h', kind: 'peripheral', vendor: 'Dell',
    name: 'Dell P2425H', detail: '24" Full HD · height adjustable', monthlyPrice: 5, purchasePrice: 159,
    image: '/catalog/photos/pe-p2425h.webp',
  },
  {
    id: 'pe-studio-display', kind: 'peripheral', vendor: 'Apple',
    name: 'Apple Studio Display', detail: '27" 5K Retina · tilt-adjustable stand', monthlyPrice: 24, purchasePrice: 1499,
    image: '/catalog/photos/pe-studio-display.webp',
  },
  {
    id: 'pe-thunderbolt-dock', kind: 'peripheral', vendor: 'Dell',
    name: 'Dell Thunderbolt Dock WD22TB4', detail: 'Single-cable desk setup · 130 W', monthlyPrice: 6, purchasePrice: 229,
    image: '/catalog/photos/pe-thunderbolt-dock.webp',
  },
  {
    id: 'pe-mx-combo', kind: 'peripheral', vendor: 'Logitech',
    name: 'Logitech MX Keys S & MX Master 3S', detail: 'Wireless keyboard and mouse combo', monthlyPrice: 3, purchasePrice: 139,
    image: '/catalog/photos/pe-mx-combo.webp',
  },
  {
    id: 'pe-jabra-evolve2-65', kind: 'peripheral', vendor: 'Jabra',
    name: 'Jabra Evolve2 65', detail: 'Wireless ANC headset · Teams certified', monthlyPrice: 5, purchasePrice: 169,
    image: '/catalog/photos/pe-jabra-evolve2-65.webp',
  },
  {
    id: 'pe-smartcard-reader', kind: 'peripheral', vendor: 'HID',
    name: 'HID OMNIKEY 3121 reader', detail: 'NHS Smartcard reader · USB', monthlyPrice: 1, purchasePrice: 25,
    image: '/catalog/photos/pe-smartcard-reader.webp',
  },
  {
    id: 'pe-zebra-cradle', kind: 'peripheral', vendor: 'Zebra',
    name: 'Zebra charging cradle', detail: 'Single-slot charge & sync cradle', monthlyPrice: 3, purchasePrice: 79,
    image: '/catalog/photos/pe-zebra-cradle.webp',
  },
  {
    id: 'pe-vehicle-mount', kind: 'peripheral', vendor: 'Brodit',
    name: 'Brodit vehicle mount & charger', detail: 'Hard-wired cradle for cab use', monthlyPrice: 3, purchasePrice: 89,
    image: '/catalog/photos/pe-vehicle-mount.webp',
  },
  {
    id: 'pe-apc-ups', kind: 'peripheral', vendor: 'APC',
    name: 'APC Back-UPS Pro 1500', detail: 'Rack-mount UPS for network cabinet', monthlyPrice: 11, purchasePrice: 389,
    image: '/catalog/photos/pe-apc-ups.webp',
  },

  // --- Games studio hardware -------------------------------------------------
  {
    id: 'hw-hp-z4-g5', kind: 'hardware', deviceType: 'workstation', vendor: 'HP',
    name: 'HP Z4 G5 Workstation', detail: 'Artist & tech-art workstation · monitors not included', monthlyPrice: 118, purchasePrice: 4290,
    image: '/catalog/photos/hw-hp-z4-g5.webp',
    specs: [
      spec('Processor', 'Intel Xeon w5-2455X, 12 cores'),
      spec('Memory', '128 GB DDR5 ECC'),
      spec('Storage', '4 TB NVMe SSD'),
      spec('Graphics', 'NVIDIA RTX 5000 Ada, 32 GB'),
      spec('Network', '10GbE'),
      spec('OS', 'Windows 11 Pro for Workstations'),
    ],
  },
  {
    id: 'hw-thinkstation-p3', kind: 'hardware', deviceType: 'workstation', vendor: 'Lenovo',
    name: 'Lenovo ThinkStation P3 Tower', detail: 'Engine programmer workstation · fast shader and code compiles', monthlyPrice: 92, purchasePrice: 3190,
    image: '/catalog/photos/hw-thinkstation-p3.webp',
    specs: [
      spec('Processor', 'Intel Core i9-14900K, 24 cores'),
      spec('Memory', '96 GB DDR5'),
      spec('Storage', '2 TB + 4 TB NVMe SSD'),
      spec('Graphics', 'NVIDIA RTX 4000 Ada, 20 GB'),
      spec('Network', '10GbE'),
      spec('OS', 'Windows 11 Pro'),
    ],
  },
  {
    id: 'hw-synology-rs2423', kind: 'hardware', deviceType: 'rack-server', vendor: 'Synology',
    name: 'Synology RackStation RS2423RP+', detail: 'Rack NAS for Perforce depots, build cache and asset archive', monthlyPrice: 64, purchasePrice: 2380,
    image: '/catalog/photos/hw-synology-rs2423.webp',
    specs: [
      spec('Drives', '12 × 8 TB NAS HDD (96 TB raw)'),
      spec('Network', '2 × 10GbE'),
      spec('Power', 'Redundant PSUs'),
      spec('Protection', 'Snapshots + offsite replication'),
    ],
  },
  {
    id: 'pe-cintiq-pro-27', kind: 'peripheral', vendor: 'Wacom',
    name: 'Wacom Cintiq Pro 27', detail: '27" 4K pen display · Pro Pen 3', monthlyPrice: 62, purchasePrice: 2829,
    image: '/catalog/photos/pe-cintiq-pro-27.webp',
  },
  {
    id: 'pe-u3224kb', kind: 'peripheral', vendor: 'Dell',
    name: 'Dell UltraSharp 32 6K U3224KB', detail: '32" 6K · Thunderbolt 4 hub · built-in webcam', monthlyPrice: 32, purchasePrice: 1899,
    image: '/catalog/photos/pe-u3224kb.webp',
  },
  {
    id: 'pe-elgato-4k-pro', kind: 'peripheral', vendor: 'Elgato',
    name: 'Elgato 4K Pro capture card', detail: 'PCIe · 4K60 HDR capture for console and PC test passes', monthlyPrice: 6, purchasePrice: 219,
    image: '/catalog/photos/pe-elgato-4k-pro.webp',
  },
];

// ---------------------------------------------------------------------------
// Software catalogue: individual licences, per seat per month (approximate UK list prices, mock)
// ---------------------------------------------------------------------------

function product(
  id: string,
  name: string,
  vendor: string,
  category: SoftwareProduct['category'],
  monthlyPricePerSeat: number,
  detail: string,
  logo?: string,
): SoftwareProduct {
  return { id, name, vendor, category, monthlyPricePerSeat, detail, logo };
}

const M365_LOGO = '/software-logos/microsoft-365.svg';

export const softwareProducts: SoftwareProduct[] = [
  // --- Productivity ---------------------------------------------------------
  product('sw-m365-business-basic', 'Microsoft 365 Business Basic', 'Microsoft', 'productivity', 4.9, 'Web and mobile Office apps, Teams, Exchange, 1 TB OneDrive', M365_LOGO),
  product('sw-m365-business-standard', 'Microsoft 365 Business Standard', 'Microsoft', 'productivity', 10.3, 'Desktop Office apps, Teams, Exchange, 1 TB OneDrive', M365_LOGO),
  product('sw-m365-bp', 'Microsoft 365 Business Premium', 'Microsoft', 'productivity', 18.1, 'Business Standard plus Intune, Entra ID P1 and Defender for Business', M365_LOGO),
  product('sw-m365-e3', 'Microsoft 365 E3', 'Microsoft', 'productivity', 30.8, 'Enterprise Office apps, Intune, Entra ID P1, unlimited archiving', M365_LOGO),
  product('sw-m365-e5', 'Microsoft 365 E5', 'Microsoft', 'productivity', 47.7, 'E3 plus Defender XDR, Purview compliance, Power BI Pro, Entra ID P2', M365_LOGO),
  product('sw-google-workspace', 'Google Workspace Business Standard', 'Google', 'productivity', 11.8, 'Gmail, Drive (2 TB pooled), Meet recording, Docs', '/software-logos/google-workspace.svg'),
  product('sw-visio', 'Visio Plan 2', 'Microsoft', 'productivity', 11.4, 'Desktop diagramming with advanced shapes and templates', '/software-logos/microsoft-visio.svg'),
  product('sw-project', 'Project Plan 3', 'Microsoft', 'productivity', 22.6, 'Project desktop app and portfolio scheduling', '/software-logos/microsoft-project.svg'),
  product('sw-dropbox', 'Dropbox Business', 'Dropbox', 'productivity', 12, 'Team storage, file recovery and e-signatures', 'dropbox'),
  product('sw-box', 'Box Business', 'Box', 'productivity', 13.5, 'Unlimited storage, Box AI and compliance controls', 'box'),
  product('sw-grammarly', 'Grammarly Business', 'Grammarly', 'productivity', 12, 'Writing assistance, brand tones and style guides', 'grammarly'),
  product('sw-deepl', 'DeepL Pro Advanced', 'DeepL', 'productivity', 21, 'Document and text translation in 30+ languages', 'deepl'),

  // --- AI assistants --------------------------------------------------------
  product('sw-m365-copilot', 'Microsoft 365 Copilot', 'Microsoft', 'ai', 24.7, 'AI in Word, Excel, Outlook and Teams, grounded in work data', '/software-logos/microsoft-copilot.svg'),
  product('sw-chatgpt-team', 'ChatGPT Team', 'OpenAI', 'ai', 24, 'Latest GPT models, shared workspace, no training on your data', '/software-logos/chatgpt.svg'),
  product('sw-chatgpt-enterprise', 'ChatGPT Enterprise', 'OpenAI', 'ai', 48, 'SSO/SCIM, expanded context and usage, enterprise analytics', '/software-logos/chatgpt.svg'),
  product('sw-claude-team', 'Claude Team', 'Anthropic', 'ai', 24, 'Claude for work: Projects, shared chats, higher usage limits', 'claude'),
  product('sw-claude-enterprise', 'Claude Enterprise', 'Anthropic', 'ai', 48, 'SSO/SCIM, audit logs, expanded context and admin controls', 'claude'),
  product('sw-gemini-workspace', 'Gemini for Google Workspace', 'Google', 'ai', 16, 'Gemini in Gmail, Docs, Sheets and Meet', 'googlegemini'),
  product('sw-perplexity', 'Perplexity Enterprise Pro', 'Perplexity', 'ai', 32, 'AI research with cited sources, file analysis and SSO', 'perplexity'),
  product('sw-github-copilot-business', 'GitHub Copilot Business', 'GitHub', 'ai', 15, 'AI pair programmer in the IDE with policy management', 'githubcopilot'),
  product('sw-github-copilot-enterprise', 'GitHub Copilot Enterprise', 'GitHub', 'ai', 31, 'Copilot Business plus codebase-aware chat and PR summaries', 'githubcopilot'),
  product('sw-cursor', 'Cursor Business', 'Anysphere', 'ai', 32, 'AI-first code editor with privacy mode and admin dashboard', 'cursor'),

  // --- Design & creative ----------------------------------------------------
  product('sw-adobe-cc-all-apps', 'Creative Cloud All Apps', 'Adobe', 'design', 84.5, '20+ apps incl. Photoshop, Illustrator, InDesign, Premiere Pro; 1 TB storage', '/software-logos/adobe-creative-cloud.svg'),
  product('sw-photoshop', 'Photoshop', 'Adobe', 'design', 33, 'Photo editing and compositing with generative fill', '/software-logos/adobe-photoshop.svg'),
  product('sw-illustrator', 'Illustrator', 'Adobe', 'design', 33, 'Vector graphics, logos and illustration', '/software-logos/adobe-illustrator.svg'),
  product('sw-indesign', 'InDesign', 'Adobe', 'design', 33, 'Page layout for print and digital publishing', '/software-logos/adobe-indesign.svg'),
  product('sw-premiere-pro', 'Premiere Pro', 'Adobe', 'design', 33, 'Professional video editing', '/software-logos/adobe-premiere-pro.svg'),
  product('sw-after-effects', 'After Effects', 'Adobe', 'design', 33, 'Motion graphics and visual effects', '/software-logos/adobe-after-effects.svg'),
  product('sw-acrobat-pro', 'Acrobat Pro', 'Adobe', 'design', 18, 'Create, edit, sign and protect PDFs', '/software-logos/adobe-acrobat.svg'),
  product('sw-figma', 'Figma Professional', 'Figma', 'design', 13, 'Interface design, prototyping and Dev Mode', 'figma'),
  product('sw-canva', 'Canva Teams', 'Canva', 'design', 8, 'Brand kits, templates and Magic Studio', '/software-logos/canva.png'),
  product('sw-sketch', 'Sketch', 'Sketch', 'design', 9, 'Mac-native UI design with shared libraries', 'sketch'),

  // --- Development ----------------------------------------------------------
  product('sw-jetbrains-all-products', 'JetBrains All Products Pack', 'JetBrains', 'development', 51, 'Every JetBrains IDE incl. IntelliJ IDEA, PyCharm, Rider and WebStorm', 'jetbrains'),
  product('sw-intellij', 'IntelliJ IDEA Ultimate', 'JetBrains', 'development', 39, 'Java and Kotlin IDE with Spring and database tools', 'intellijidea'),
  product('sw-pycharm', 'PyCharm Professional', 'JetBrains', 'development', 16, 'Python IDE with scientific and web tooling', 'pycharm'),
  product('sw-webstorm', 'WebStorm', 'JetBrains', 'development', 10.5, 'JavaScript and TypeScript IDE', 'webstorm'),
  product('sw-rider', 'Rider', 'JetBrains', 'development', 27, '.NET and game development IDE', 'rider'),
  product('sw-datagrip', 'DataGrip', 'JetBrains', 'development', 15, 'IDE for databases and SQL', 'datagrip'),
  product('sw-visual-studio', 'Visual Studio Professional', 'Microsoft', 'development', 36, 'Visual Studio IDE with Azure dev/test benefits', '/software-logos/visual-studio.svg'),
  product('sw-github-enterprise', 'GitHub Enterprise', 'GitHub', 'development', 17, 'Repositories, Actions, SAML SSO and audit log', 'github'),
  product('sw-gitlab-premium', 'GitLab Premium', 'GitLab', 'development', 23, 'DevSecOps platform with merge approvals and CI/CD', 'gitlab'),
  product('sw-docker-business', 'Docker Business', 'Docker', 'development', 19, 'Docker Desktop with SSO and image access management', 'docker'),
  product('sw-postman', 'Postman Basic', 'Postman', 'development', 11, 'API design, testing and team workspaces', 'postman'),

  // --- Collaboration --------------------------------------------------------
  product('sw-slack', 'Slack Business+', 'Salesforce', 'collaboration', 10.3, 'Channels, huddles, SAML SSO and 99.99% uptime SLA', '/software-logos/slack.svg'),
  product('sw-zoom', 'Zoom Workplace Business', 'Zoom', 'collaboration', 17, 'Meetings for up to 300, whiteboard and team chat', 'zoom'),
  product('sw-notion', 'Notion Business', 'Notion', 'collaboration', 15, 'Docs, wikis and projects with Notion AI', 'notion'),
  product('sw-miro', 'Miro Business', 'Miro', 'collaboration', 13, 'Online whiteboard with templates and SSO', 'miro'),
  product('sw-jira', 'Jira Standard', 'Atlassian', 'collaboration', 6, 'Issue and project tracking for software teams', 'jira'),
  product('sw-confluence', 'Confluence Standard', 'Atlassian', 'collaboration', 5, 'Team wiki and documentation', 'confluence'),
  product('sw-asana', 'Asana Advanced', 'Asana', 'collaboration', 20, 'Portfolios, goals and workload management', 'asana'),
  product('sw-loom', 'Loom Business', 'Atlassian', 'collaboration', 12, 'Async video messages with unlimited recording', 'loom'),
  product('sw-calendly', 'Calendly Teams', 'Calendly', 'collaboration', 13, 'Scheduling with routing and round-robin', 'calendly'),

  // --- Communications -------------------------------------------------------
  product('sw-teams-phone', 'Teams Phone with Calling Plan', 'Microsoft', 'communications', 13, 'UK numbers, auto-attendants and call queues', '/software-logos/microsoft-teams.svg'),
  product('sw-zoom-phone', 'Zoom Phone Pro', 'Zoom', 'communications', 8, 'Cloud phone system with UK metered calling', 'zoom'),
  product('sw-webex-calling', 'Webex Calling', 'Cisco', 'communications', 12, 'Cloud PBX with UK numbers and mobile app', 'webex'),
  product('sw-dubber', 'Dubber Call Recording', 'Dubber', 'communications', 9, 'FCA-compliant recording for Teams and mobile', '/software-logos/dubber.svg'),

  // --- Sales & service ------------------------------------------------------
  product('sw-salesforce-sales-cloud', 'Salesforce Sales Cloud Enterprise', 'Salesforce', 'sales', 132, 'Pipeline, forecasting and Einstein insights', '/software-logos/salesforce.svg'),
  product('sw-hubspot-sales', 'HubSpot Sales Hub Professional', 'HubSpot', 'sales', 80, 'Sequences, forecasting and quotes', 'hubspot'),
  product('sw-linkedin-sales-navigator', 'LinkedIn Sales Navigator Core', 'LinkedIn', 'sales', 70, 'Lead search, InMail credits and CRM sync', '/software-logos/linkedin.svg'),
  product('sw-docusign', 'DocuSign Business Pro', 'DocuSign', 'sales', 32, 'E-signatures with payments and bulk send', '/software-logos/docusign.svg'),
  product('sw-zendesk', 'Zendesk Suite Professional', 'Zendesk', 'sales', 90, 'Ticketing, live chat and help centre', 'zendesk'),
  product('sw-intercom', 'Intercom', 'Intercom', 'sales', 68, 'Customer messaging with the Fin AI agent', 'intercom'),

  // --- Security & identity --------------------------------------------------
  product('sw-defender-endpoint', 'Defender for Endpoint P2', 'Microsoft', 'security', 4.2, 'EDR, vulnerability management and automated investigation', '/software-logos/microsoft-defender.svg'),
  product('sw-intune-suite', 'Microsoft Intune Suite', 'Microsoft', 'security', 8.2, 'Remote Help, Endpoint Privilege Management and advanced analytics', '/software-logos/microsoft-intune.svg'),
  product('sw-crowdstrike', 'CrowdStrike Falcon Pro', 'CrowdStrike', 'security', 7, 'Next-gen antivirus with firewall and device control', '/software-logos/crowdstrike.png'),
  product('sw-1password', '1Password Business', '1Password', 'security', 6.4, 'Password manager with SSO unlock and admin controls', '1password'),
  product('sw-bitwarden', 'Bitwarden Enterprise', 'Bitwarden', 'security', 4.8, 'Open-source password manager with SSO and policies', 'bitwarden'),
  product('sw-okta', 'Okta Workforce Identity', 'Okta', 'security', 4, 'Single sign-on and adaptive MFA', 'okta'),
  product('sw-cloudflare-zt', 'Cloudflare Zero Trust', 'Cloudflare', 'security', 6, 'Secure access, gateway and browser isolation', 'cloudflare'),
  product('sw-soti-mobicontrol', 'SOTI MobiControl', 'SOTI', 'security', 4, 'Rugged device management and kiosk lockdown', '/software-logos/soti.png'),

  // --- Line of business -----------------------------------------------------
  product('sw-autocad', 'AutoCAD', 'Autodesk', 'line-of-business', 180, '2D/3D CAD drafting with industry toolsets', 'autocad'),
  product('sw-autodesk-inventor', 'Inventor Professional', 'Autodesk', 'line-of-business', 205, '3D mechanical design, simulation and documentation', 'autodesk'),
  product('sw-bloomberg-terminal', 'Bloomberg Terminal', 'Bloomberg', 'line-of-business', 1760, 'Real-time market data, analytics and messaging', '/software-logos/bloomberg.svg'),
  product('sw-lseg-workspace', 'LSEG Workspace', 'LSEG', 'line-of-business', 1050, 'Market data, news and analytics (formerly Refinitiv Eikon)', '/software-logos/lseg.svg'),
  product('sw-tableau', 'Tableau Creator', 'Salesforce', 'line-of-business', 60, 'Visual analytics with Tableau Desktop and Prep', '/software-logos/tableau.png'),
  product('sw-power-bi-pro', 'Power BI Pro', 'Microsoft', 'line-of-business', 11, 'Self-service BI; share reports and dashboards', '/software-logos/power-bi.svg'),
  product('sw-emis-web', 'EMIS Web', 'Optum', 'line-of-business', 0, 'GP clinical system: records, prescribing and appointments (NHS-funded)', '/software-logos/emis.png'),
  product('sw-accurx', 'Accurx Plus', 'Accurx', 'line-of-business', 6, 'Patient messaging, video consultations and online triage', '/software-logos/accurx.png'),
  product('sw-mintsoft', 'Mintsoft WMS', 'Mintsoft', 'line-of-business', 25, 'Warehouse picking, put-away and stock counts', '/software-logos/mintsoft.svg'),
  product('sw-descartes-route-planner', 'Descartes Route Planner', 'Descartes', 'line-of-business', 22, 'Route optimisation and proof of delivery for drivers', '/software-logos/descartes.png'),

  // --- Games development ---------------------------------------------------------
  product('sw-unreal', 'Unreal Engine', 'Epic Games', 'development', 0, 'No seat fee for games: 5% royalty on a title’s gross revenue over $1M', 'unrealengine'),
  product('sw-unity-pro', 'Unity Pro', 'Unity', 'development', 150, 'Required above $200k annual revenue · console build support', 'unity'),
  product('sw-perforce', 'Perforce P4 (Helix Core)', 'Perforce', 'development', 32, 'Version control for code and large binary assets', 'perforce'),
  product('sw-parsec-teams', 'Parsec for Teams', 'Unity', 'collaboration', 25, 'Low-latency remote access to studio workstations'),
  product('sw-maya', 'Maya', 'Autodesk', 'design', 190, 'Animation, rigging and modelling', 'autodeskmaya'),
  product('sw-maya-indie', 'Maya Indie', 'Autodesk', 'design', 26, 'Full Maya for studios earning under $100k a year', 'autodeskmaya'),
  product('sw-houdini-fx', 'Houdini FX', 'SideFX', 'design', 175, 'Procedural VFX, destruction and simulation', 'houdini'),
  product('sw-houdini-indie', 'Houdini Indie', 'SideFX', 'design', 22, 'Full Houdini for studios earning under $100k a year', 'houdini'),
  product('sw-zbrush', 'ZBrush', 'Maxon', 'design', 34, 'Digital sculpting for characters and props'),
  product('sw-substance', 'Substance 3D Collection', 'Adobe', 'design', 80, 'Painter, Designer and Sampler for texturing'),
  product('sw-blender', 'Blender', 'Blender Foundation', 'design', 0, 'Free, open-source 3D suite: modelling, animation, rendering', 'blender'),
];

/** Client-made licence bundles: a quick way to assign several licences together. */
export const licenceBundles: LicenceBundle[] = [
  {
    id: 'bdl-acme-sales', tenantId: 't-acme', name: 'Sales toolkit',
    description: 'CRM, prospecting and a desk line for the regional sales team.',
    softwareIds: ['sw-salesforce-sales-cloud', 'sw-linkedin-sales-navigator', 'sw-teams-phone'],
    updatedAt: '2026-06-10T08:15:00Z', updatedBy: 'Sarah Whitfield',
  },
  {
    id: 'bdl-acme-design', tenantId: 't-acme', name: 'Product design',
    description: 'CAD tools for the design office.',
    softwareIds: ['sw-autocad', 'sw-autodesk-inventor'],
    updatedAt: '2026-08-22T13:40:00Z', updatedBy: 'Sarah Whitfield',
  },
  {
    id: 'bdl-acme-marketing', tenantId: 't-acme', name: 'Marketing creative',
    description: 'Adobe apps and Canva for the marketing team.',
    softwareIds: ['sw-photoshop', 'sw-illustrator', 'sw-indesign', 'sw-canva'],
    updatedAt: '2026-07-01T09:00:00Z', updatedBy: 'Sarah Whitfield',
  },
  {
    id: 'bdl-acme-warehouse', tenantId: 't-acme', name: 'Warehouse handhelds',
    description: 'Device lockdown and the WMS client for scanners.',
    softwareIds: ['sw-soti-mobicontrol', 'sw-mintsoft'],
    updatedAt: '2026-09-03T10:05:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'bdl-globex-analyst', tenantId: 't-globex', name: 'Analyst desk',
    description: 'Market data terminals with compliant call recording.',
    softwareIds: ['sw-bloomberg-terminal', 'sw-lseg-workspace', 'sw-dubber'],
    updatedAt: '2026-09-11T09:25:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'bdl-globex-client', tenantId: 't-globex', name: 'Client services',
    description: 'CRM, e-signatures and recorded calls for advised clients.',
    softwareIds: ['sw-salesforce-sales-cloud', 'sw-docusign', 'sw-dubber'],
    updatedAt: '2026-07-28T16:00:00Z', updatedBy: 'James Holloway',
  },
  {
    id: 'bdl-globex-ai', tenantId: 't-globex', name: 'AI assistants',
    description: 'Approved AI tools for knowledge workers.',
    softwareIds: ['sw-m365-copilot', 'sw-claude-enterprise'],
    updatedAt: '2026-09-02T12:30:00Z', updatedBy: 'James Holloway',
  },
  {
    id: 'bdl-initech-dev', tenantId: 't-initech', name: 'Developer tools',
    description: 'IDEs, source control, AI pair programming and containers.',
    softwareIds: ['sw-jetbrains-all-products', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business'],
    updatedAt: '2026-04-08T14:10:00Z', updatedBy: 'Hannah Clarke',
  },
  {
    id: 'bdl-initech-design', tenantId: 't-initech', name: 'Product design',
    description: 'Design and prototyping for the product team.',
    softwareIds: ['sw-figma', 'sw-miro', 'sw-adobe-cc-all-apps'],
    updatedAt: '2026-05-19T11:00:00Z', updatedBy: 'Hannah Clarke',
  },
  {
    id: 'bdl-initech-ai', tenantId: 't-initech', name: 'AI for engineers',
    description: 'Chat assistants alongside Copilot in the IDE.',
    softwareIds: ['sw-claude-team', 'sw-chatgpt-team'],
    updatedAt: '2026-09-16T11:45:00Z', updatedBy: 'Hannah Clarke',
  },
  {
    id: 'bdl-umbrella-clinical', tenantId: 't-umbrella', name: 'Clinical',
    description: 'GP clinical system and patient messaging.',
    softwareIds: ['sw-emis-web', 'sw-accurx'],
    updatedAt: '2026-08-14T08:50:00Z', updatedBy: 'Nadia Hussain',
  },
  {
    id: 'bdl-northwind-driver', tenantId: 't-northwind', name: 'Driver apps',
    description: 'Locked-down phone with routing and proof of delivery.',
    softwareIds: ['sw-soti-mobicontrol', 'sw-descartes-route-planner'],
    updatedAt: '2026-09-09T07:40:00Z', updatedBy: 'Callum Fraser',
  },
  {
    id: 'bdl-forgewright-art', tenantId: 't-forgewright', name: 'Art pipeline',
    description: 'Modelling, sculpting and texturing for environment and character artists.',
    softwareIds: ['sw-maya', 'sw-zbrush', 'sw-substance', 'sw-unreal', 'sw-perforce'],
    updatedAt: '2026-05-18T09:30:00Z', updatedBy: 'Rachel Thornton',
  },
  {
    id: 'bdl-forgewright-engine', tenantId: 't-forgewright', name: 'Engine team',
    description: 'Unreal, source control and IDEs for engine and gameplay programmers.',
    softwareIds: ['sw-unreal', 'sw-perforce', 'sw-visual-studio', 'sw-rider'],
    updatedAt: '2026-05-18T09:35:00Z', updatedBy: 'Rachel Thornton',
  },
  {
    id: 'bdl-forgewright-contractor', tenantId: 't-forgewright', name: 'Contractor starter',
    description: 'Least access for short-term contractors. Review at the end of each project.',
    softwareIds: ['sw-unreal', 'sw-perforce'],
    updatedAt: '2026-08-29T15:10:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'bdl-lanternfly-dev', tenantId: 't-lanternfly', name: 'Unity dev',
    description: 'Engine, IDE and remote access for working from home.',
    softwareIds: ['sw-unity-pro', 'sw-rider', 'sw-parsec-teams'],
    updatedAt: '2026-03-04T10:00:00Z', updatedBy: 'Tom Ashworth',
  },
  {
    id: 'bdl-lanternfly-art', tenantId: 't-lanternfly', name: 'Art',
    description: 'Indie-priced 3D and texturing tools.',
    softwareIds: ['sw-unity-pro', 'sw-blender', 'sw-substance', 'sw-houdini-indie'],
    updatedAt: '2026-03-04T10:05:00Z', updatedBy: 'Tom Ashworth',
  },
];

// ---------------------------------------------------------------------------
// Onboardings (new hires: optional hardware kit + software licences)
// ---------------------------------------------------------------------------

export const onboardings: Onboarding[] = [
  {
    id: 'onb-3018', reference: 'ONB-3018', tenantId: 't-forgewright', person: 'Eleanor Hughes', jobTitle: 'Senior Environment Artist',
    startDate: '2026-10-05', kitId: 'kit-forgewright-artist', orderId: 'o-011',
    softwareIds: [...TENANT_BASELINES['t-forgewright'], 'sw-maya', 'sw-zbrush', 'sw-substance', 'sw-unreal', 'sw-perforce'],
    status: 'in-progress', requestedBy: 'Rachel Thornton', createdAt: '2026-09-22T10:30:00Z',
  },
  {
    id: 'onb-3017', reference: 'ONB-3017', tenantId: 't-globex', person: 'Samuel Adeyemi', jobTitle: 'Equity Analyst',
    startDate: '2026-10-12', kitId: 'kit-globex-analyst', orderId: 'o-008',
    softwareIds: [...TENANT_BASELINES['t-globex'], 'sw-bloomberg-terminal', 'sw-lseg-workspace', 'sw-dubber'],
    status: 'scheduled', requestedBy: 'James Holloway', createdAt: '2026-09-24T10:12:00Z',
  },
  {
    id: 'onb-3016', reference: 'ONB-3016', tenantId: 't-acme', person: 'Joanna Pike', jobTitle: 'Account Executive',
    startDate: '2026-10-05', kitId: 'kit-acme-sales', orderId: 'o-007',
    softwareIds: [...TENANT_BASELINES['t-acme'], 'sw-salesforce-sales-cloud', 'sw-teams-phone'],
    status: 'scheduled', requestedBy: 'Sarah Whitfield', createdAt: '2026-09-24T08:47:00Z',
  },
  {
    id: 'onb-3013', reference: 'ONB-3013', tenantId: 't-initech', person: 'Lucy Morgan', jobTitle: 'Platform Engineer',
    startDate: '2026-09-28', kitId: 'kit-initech-developer', orderId: 'o-006',
    softwareIds: [...TENANT_BASELINES['t-initech'], 'sw-jetbrains-all-products', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business'],
    status: 'in-progress', requestedBy: 'Hannah Clarke', createdAt: '2026-09-21T14:30:00Z',
  },
  {
    id: 'onb-3012', reference: 'ONB-3012', tenantId: 't-acme', person: 'Tom Brennan', jobTitle: 'Area Sales Manager',
    startDate: '2026-09-28', kitId: 'kit-acme-sales', orderId: 'o-005',
    softwareIds: [...TENANT_BASELINES['t-acme'], 'sw-salesforce-sales-cloud', 'sw-teams-phone'],
    status: 'in-progress', requestedBy: 'Sarah Whitfield', createdAt: '2026-09-22T09:05:00Z',
  },
  {
    id: 'onb-3010', reference: 'ONB-3010', tenantId: 't-globex', person: 'Oliver Grant', jobTitle: 'Managing Director',
    startDate: '2026-09-29', kitId: 'kit-globex-executive', orderId: 'o-004',
    softwareIds: [...TENANT_BASELINES['t-globex'], 'sw-m365-copilot', 'sw-dubber'],
    status: 'in-progress', requestedBy: 'James Holloway', createdAt: '2026-09-19T11:40:00Z',
  },
  {
    id: 'onb-3004', reference: 'ONB-3004', tenantId: 't-acme', person: 'Megan Doyle', jobTitle: 'Inside Sales Representative',
    startDate: '2026-09-14', kitId: 'kit-acme-sales', orderId: 'o-002',
    softwareIds: [...TENANT_BASELINES['t-acme'], 'sw-salesforce-sales-cloud', 'sw-teams-phone'],
    status: 'completed', requestedBy: 'Sarah Whitfield', createdAt: '2026-09-08T10:00:00Z',
  },
  {
    id: 'onb-3001', reference: 'ONB-3001', tenantId: 't-globex', person: 'Amara Nwosu', jobTitle: 'Client Services Associate',
    startDate: '2026-09-01', kitId: 'kit-globex-client-services', orderId: 'o-001',
    softwareIds: [...TENANT_BASELINES['t-globex'], 'sw-salesforce-sales-cloud', 'sw-dubber', 'sw-docusign'],
    status: 'completed', requestedBy: 'James Holloway', createdAt: '2026-08-26T13:15:00Z',
  },
];

// ---------------------------------------------------------------------------
// Licences: seat pools per client and who holds each seat
// ---------------------------------------------------------------------------

/** Existing staff and what they're licensed for (new hires come from onboardings above). */
/** A current employee's licences: their client's baseline plus role-specific extras. */
function staff(tenantId: string, person: string, since: string, extras: string[], endsOn?: string) {
  return { tenantId, person, since, endsOn, softwareIds: [...TENANT_BASELINES[tenantId], ...extras] };
}

const licensedStaff: { tenantId: string; person: string; softwareIds: string[]; since: string; endsOn?: string }[] = [
  staff('t-acme', 'Sarah Whitfield', '2023-06-12', ['sw-salesforce-sales-cloud', 'sw-teams-phone', 'sw-m365-copilot']),
  staff('t-acme', 'Daniel Okafor', '2023-11-06', ['sw-salesforce-sales-cloud', 'sw-teams-phone', 'sw-linkedin-sales-navigator']),
  staff('t-acme', 'Priya Raman', '2024-05-20', ['sw-autocad', 'sw-autodesk-inventor']),
  staff('t-acme', 'Megan Doyle', '2026-09-14', ['sw-salesforce-sales-cloud', 'sw-teams-phone']),
  staff('t-globex', 'James Holloway', '2023-04-03', ['sw-salesforce-sales-cloud', 'sw-dubber', 'sw-m365-copilot', 'sw-claude-enterprise']),
  staff('t-globex', 'Amara Nwosu', '2026-09-01', ['sw-salesforce-sales-cloud', 'sw-dubber', 'sw-docusign']),
  staff('t-globex', 'Chloe Bennett', '2023-09-04', ['sw-salesforce-sales-cloud', 'sw-dubber'], '2026-10-19'),
  staff('t-initech', 'Hannah Clarke', '2024-04-01', ['sw-jira', 'sw-confluence', 'sw-teams-phone', 'sw-claude-team']),
  staff('t-initech', 'Ravi Patel', '2024-09-09', ['sw-jetbrains-all-products', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business', 'sw-jira']),
  staff('t-initech', 'Grace Liu', '2024-04-15', ['sw-intellij', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business', 'sw-jira', 'sw-claude-team']),
  staff('t-initech', 'Ethan Walsh', '2025-02-03', ['sw-webstorm', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-figma', 'sw-jira']),
  staff('t-umbrella', 'Nadia Hussain', '2024-02-19', ['sw-emis-web', 'sw-accurx', 'sw-power-bi-pro']),
  staff('t-umbrella', 'Dr. Emily Shaw', '2025-05-12', ['sw-emis-web', 'sw-accurx']),
  staff('t-umbrella', 'Marcus Reid', '2025-05-12', ['sw-emis-web', 'sw-accurx'], '2026-10-30'),
  staff('t-northwind', 'Callum Fraser', '2025-09-22', ['sw-teams-phone', 'sw-descartes-route-planner']),
  staff('t-northwind', 'Isla Robertson', '2025-10-06', ['sw-teams-phone']),
  staff('t-northwind', 'Jamie Stewart', '2026-09-12', ['sw-soti-mobicontrol', 'sw-descartes-route-planner']),
  staff('t-forgewright', 'Rachel Thornton', '2025-11-03', ['sw-m365-copilot', 'sw-miro', 'sw-confluence']),
  staff('t-forgewright', 'Priyanka Shah', '2025-11-17', ['sw-maya', 'sw-zbrush', 'sw-substance', 'sw-houdini-fx', 'sw-unreal', 'sw-perforce']),
  staff('t-forgewright', 'Ben Hartley', '2025-11-17', ['sw-maya', 'sw-zbrush', 'sw-substance', 'sw-unreal', 'sw-perforce']),
  staff('t-forgewright', 'Sofia Marin', '2025-11-17', ['sw-unreal', 'sw-perforce', 'sw-visual-studio', 'sw-rider']),
  staff('t-forgewright', 'Arjun Mehta', '2026-02-09', ['sw-unreal', 'sw-perforce', 'sw-visual-studio']),
  staff('t-forgewright', 'Kasia Nowak', '2026-02-09', ['sw-unreal', 'sw-perforce', 'sw-rider', 'sw-github-copilot-business', 'sw-parsec-teams']),
  staff('t-forgewright', 'Hollie Grant', '2025-12-01', ['sw-unreal', 'sw-perforce']),
  staff('t-forgewright', 'Dan Whitaker', '2026-01-12', ['sw-miro', 'sw-confluence']),
  // A contract environment artist whose project ends next month.
  staff('t-forgewright', 'Tom Mercer', '2026-06-01', ['sw-maya', 'sw-substance', 'sw-unreal', 'sw-perforce'], '2026-10-10'),
  staff('t-lanternfly', 'Tom Ashworth', '2026-03-02', ['sw-unity-pro', 'sw-rider', 'sw-parsec-teams']),
  staff('t-lanternfly', 'Mia Chen', '2026-03-02', ['sw-unity-pro', 'sw-blender', 'sw-substance', 'sw-houdini-indie']),
  staff('t-lanternfly', 'Jas Kaur', '2026-03-02', ['sw-figma']),
  staff('t-lanternfly', 'Leo Barnes', '2026-04-06', ['sw-unity-pro', 'sw-blender']),
];

export const licenceAssignments: LicenceAssignment[] = [
  ...licensedStaff.flatMap((staff) =>
    staff.softwareIds.map((softwareId) => ({
      id: `la-${staff.tenantId}-${softwareId}-${staff.person}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      tenantId: staff.tenantId, softwareId, person: staff.person,
      status: 'active' as const, startsOn: null, endsOn: staff.endsOn ?? null,
      assignedAt: `${staff.since}T09:00:00Z`, assignedBy: 'Jordan Blake',
    })),
  ),
  ...onboardings
    .filter((onboarding) => onboarding.status !== 'completed')
    .flatMap((onboarding) =>
      onboarding.softwareIds.map((softwareId) => ({
        id: `la-${onboarding.tenantId}-${softwareId}-${onboarding.person}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        tenantId: onboarding.tenantId, softwareId, person: onboarding.person,
        status: 'scheduled' as const, startsOn: onboarding.startDate, endsOn: null,
        assignedAt: onboarding.createdAt, assignedBy: onboarding.requestedBy,
      })),
    ),
];

/** Unassigned seats per pool (default 1). 0 = full; larger numbers show unused spend. */
const SPARE_SEATS: Record<string, number> = {
  'sw-m365-bp': 3,
  'sw-m365-e5': 3,
  'sw-m365-business-standard': 2,
  'sw-m365-business-basic': 2,
  't-acme:sw-autocad': 0,
  't-acme:sw-autodesk-inventor': 0,
  't-globex:sw-bloomberg-terminal': 0,
  't-initech:sw-github-copilot-business': 0,
  't-umbrella:sw-emis-web': 2,
  // Two Houdini FX seats bought for a VFX-heavy project that finished in the summer.
  't-forgewright:sw-houdini-fx': 2,
  't-forgewright:sw-maya': 0,
};

/** Clients that buy exactly the seats they need rather than keeping one spare per pool. */
const NO_SPARE_SEATS = new Set(['t-lanternfly']);

/** Seats bought but not used by anyone (wasted spend to review). */
const UNUSED_POOLS: { tenantId: string; softwareId: string; seats: number }[] = [
  { tenantId: 't-globex', softwareId: 'sw-zoom', seats: 5 },
  { tenantId: 't-acme', softwareId: 'sw-adobe-cc-all-apps', seats: 2 },
  { tenantId: 't-initech', softwareId: 'sw-miro', seats: 3 },
];

/** Pools renew on each client's onboarding anniversary. */
function nextRenewal(onboardedAt: string): string {
  const now = new Date(MOCK_NOW);
  const renewal = new Date(`${onboardedAt}T00:00:00Z`);
  renewal.setUTCFullYear(now.getUTCFullYear());
  if (renewal <= now) renewal.setUTCFullYear(now.getUTCFullYear() + 1);
  return renewal.toISOString().slice(0, 10);
}

export const licencePools: LicencePool[] = tenants.flatMap((tenant) => {
  const used = new Map<string, number>();
  for (const assignment of licenceAssignments) {
    if (assignment.tenantId === tenant.id) used.set(assignment.softwareId, (used.get(assignment.softwareId) ?? 0) + 1);
  }
  const pools = [...used].map(([softwareId, count]) => ({
    id: `lp-${tenant.id}-${softwareId}`, tenantId: tenant.id, softwareId,
    seats:
      count +
      (SPARE_SEATS[`${tenant.id}:${softwareId}`] ?? (NO_SPARE_SEATS.has(tenant.id) ? 0 : (SPARE_SEATS[softwareId] ?? 1))),
    renewalDate: nextRenewal(tenant.onboardedAt),
  }));
  const unused = UNUSED_POOLS.filter((pool) => pool.tenantId === tenant.id).map((pool) => ({
    id: `lp-${tenant.id}-${pool.softwareId}`, tenantId: tenant.id, softwareId: pool.softwareId,
    seats: pool.seats, renewalDate: nextRenewal(tenant.onboardedAt),
  }));
  return [...pools, ...unused];
});

// ---------------------------------------------------------------------------
// Kits: Checkpoint templates (ownerTenantId: null) and each client's own kits
// ---------------------------------------------------------------------------

function line(catalogItemId: string, quantity = 1): KitLine {
  return { catalogItemId, quantity };
}

export const kits: Kit[] = [
  // --- Template library -----------------------------------------------------
  {
    id: 'tpl-developer', ownerTenantId: null, sourceTemplateId: null, icon: 'code',
    name: 'Developer Kit', tagline: 'High-performance workstation setup for engineering hires.',
    description: 'A dual-monitor workstation pre-enrolled in Intune with the standard IDE toolchain and developer access policies applied before it leaves the depot.',
    audience: 'Engineering', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-precision-5690'), line('pe-u2724de', 2), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-jetbrains-all-products', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business'],
    updatedAt: '2026-07-14T10:00:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'tpl-sales', ownerTenantId: null, sourceTemplateId: null, icon: 'headset',
    name: 'Sales Kit', tagline: 'Lightweight and call-ready for client-facing roles.',
    description: 'An ultraportable laptop and desk phone provisioned to the new hire’s extension, with CRM and sales tooling signed in on first boot.',
    audience: 'Sales & Account Management', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-x1-carbon-g12'), line('hw-poly-edge-e350'), line('pe-jabra-evolve2-65'),
    ],
    recommendedSoftwareIds: ['sw-salesforce-sales-cloud', 'sw-linkedin-sales-navigator', 'sw-teams-phone'],
    updatedAt: '2026-06-02T09:30:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'tpl-infrastructure', ownerTenantId: null, sourceTemplateId: null, icon: 'network',
    name: 'Infrastructure Drop', tagline: 'Everything a new remote office needs to go live.',
    description: 'A zero-touch network stack for a new site. Devices claim their config from the Meraki dashboard on first power-up and tunnel back to HQ over SD-WAN.',
    audience: 'New office / site', assignmentTarget: 'site', leadTimeDays: 7,
    lines: [
      line('hw-meraki-mx68'), line('hw-meraki-ms130-24p'), line('hw-meraki-mr36', 2),
      line('pe-apc-ups'),
    ],
    recommendedSoftwareIds: [],
    updatedAt: '2026-05-19T15:45:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'tpl-executive', ownerTenantId: null, sourceTemplateId: null, icon: 'briefcase',
    name: 'Executive Kit', tagline: 'Premium mobile setup for leadership hires.',
    description: 'A premium Apple setup with hardened security defaults and priority white-glove support from day one.',
    audience: 'Leadership', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-mbp16-m4-pro'), line('hw-iphone-16-pro'), line('pe-studio-display'),
    ],
    recommendedSoftwareIds: ['sw-m365-copilot', 'sw-claude-team'],
    updatedAt: '2026-08-01T11:20:00Z', updatedBy: 'Jordan Blake',
  },

  // --- Acme Corp ------------------------------------------------------------
  {
    id: 'kit-acme-sales', ownerTenantId: 't-acme', sourceTemplateId: 'tpl-sales', icon: 'headset',
    name: 'Acme Sales Kit', tagline: 'Laptop, desk phone and CRM for the regional sales team.',
    description: 'Checkpoint’s standard sales setup, unchanged, provisioned into Acme’s Salesforce org.',
    audience: 'Sales', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-x1-carbon-g12'), line('hw-poly-edge-e350'), line('pe-jabra-evolve2-65'),
    ],
    recommendedSoftwareIds: ['sw-salesforce-sales-cloud', 'sw-teams-phone'],
    updatedAt: '2026-06-10T08:15:00Z', updatedBy: 'Sarah Whitfield',
  },
  {
    id: 'kit-acme-engineering', ownerTenantId: 't-acme', sourceTemplateId: 'tpl-developer', icon: 'code',
    name: 'Design Office Kit', tagline: 'CAD-ready workstation for product engineers.',
    description: 'Based on the Developer Kit, with the tower workstation and CAD suite in place of the software development tools.',
    audience: 'Product engineering', assignmentTarget: 'user', leadTimeDays: 4,
    lines: [
      line('hw-precision-3680'), line('pe-u2724de', 2), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-autocad', 'sw-autodesk-inventor'],
    updatedAt: '2026-08-22T13:40:00Z', updatedBy: 'Sarah Whitfield',
  },
  {
    id: 'kit-acme-warehouse', ownerTenantId: 't-acme', sourceTemplateId: null, icon: 'scan',
    name: 'Warehouse Handheld Kit', tagline: 'Rugged scanner for pickers and goods-in staff.',
    description: 'A locked-down handheld that boots straight into the warehouse scanning app. Built for Acme’s Sheffield warehouse.',
    audience: 'Warehouse operations', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-zebra-tc58'), line('pe-zebra-cradle'),
    ],
    recommendedSoftwareIds: ['sw-soti-mobicontrol', 'sw-mintsoft'],
    updatedAt: '2026-09-03T10:05:00Z', updatedBy: 'Jordan Blake',
  },

  // --- Globex Solutions -----------------------------------------------------
  {
    id: 'kit-globex-client-services', ownerTenantId: 't-globex', sourceTemplateId: 'tpl-sales', icon: 'headset',
    name: 'Client Services Kit', tagline: 'Recorded lines and CRM for regulated client calls.',
    description: 'The Sales Kit with a Yealink handset and FCA-compliant call recording added for advised conversations.',
    audience: 'Client services', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-x1-carbon-g12'), line('hw-yealink-t54w'), line('pe-jabra-evolve2-65'),
    ],
    recommendedSoftwareIds: ['sw-salesforce-sales-cloud', 'sw-dubber', 'sw-docusign'],
    updatedAt: '2026-07-28T16:00:00Z', updatedBy: 'James Holloway',
  },
  {
    id: 'kit-globex-analyst', ownerTenantId: 't-globex', sourceTemplateId: 'tpl-developer', icon: 'chart',
    name: 'Analyst Kit', tagline: 'Dual-screen desk with live market data.',
    description: 'A docked ultraportable for analysts who move between desk and client sites, with market data and call recording.',
    audience: 'Research & trading', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-x1-carbon-g12'), line('pe-u2724de', 2), line('pe-thunderbolt-dock'), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-bloomberg-terminal', 'sw-lseg-workspace', 'sw-dubber'],
    updatedAt: '2026-09-11T09:25:00Z', updatedBy: 'Jordan Blake',
  },
  {
    id: 'kit-globex-executive', ownerTenantId: 't-globex', sourceTemplateId: 'tpl-executive', icon: 'briefcase',
    name: 'Executive Kit', tagline: 'Premium mobile setup for partners and directors.',
    description: 'Checkpoint’s Executive Kit with compliance call recording on the mobile line.',
    audience: 'Leadership', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-mbp16-m4-pro'), line('hw-iphone-16-pro'), line('pe-studio-display'),
    ],
    recommendedSoftwareIds: ['sw-m365-copilot', 'sw-dubber'],
    updatedAt: '2026-08-05T12:00:00Z', updatedBy: 'James Holloway',
  },

  // --- Initech --------------------------------------------------------------
  {
    id: 'kit-initech-developer', ownerTenantId: 't-initech', sourceTemplateId: 'tpl-developer', icon: 'code',
    name: 'Developer Kit', tagline: 'Windows workstation for backend and platform engineers.',
    description: 'Checkpoint’s standard Developer Kit.',
    audience: 'Engineering', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-precision-5690'), line('pe-u2724de', 2), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-jetbrains-all-products', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business'],
    updatedAt: '2026-04-08T14:10:00Z', updatedBy: 'Hannah Clarke',
  },
  {
    id: 'kit-initech-developer-mac', ownerTenantId: 't-initech', sourceTemplateId: 'tpl-developer', icon: 'code',
    name: 'Developer Kit (Mac)', tagline: 'MacBook Pro setup for mobile and frontend engineers.',
    description: 'The Developer Kit with a MacBook Pro M4 Max and Studio Display in place of the Windows workstation.',
    audience: 'Engineering', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-mbp16-m4-max'), line('pe-studio-display'), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-jetbrains-all-products', 'sw-github-enterprise', 'sw-github-copilot-business', 'sw-docker-business'],
    updatedAt: '2026-09-16T11:45:00Z', updatedBy: 'Hannah Clarke',
  },
  {
    id: 'kit-initech-office-drop', ownerTenantId: 't-initech', sourceTemplateId: 'tpl-infrastructure', icon: 'network',
    name: 'Office Drop', tagline: 'Network stack for new studio spaces.',
    description: 'The Infrastructure Drop with a FortiGate to match Initech’s existing firewall estate.',
    audience: 'New office / site', assignmentTarget: 'site', leadTimeDays: 7,
    lines: [
      line('hw-fortigate-60f'), line('hw-meraki-ms130-24p'), line('hw-meraki-mr36', 2),
    ],
    recommendedSoftwareIds: [],
    updatedAt: '2026-05-30T10:00:00Z', updatedBy: 'Jordan Blake',
  },

  // --- Umbrella Health ------------------------------------------------------
  {
    id: 'kit-umbrella-clinical', ownerTenantId: 't-umbrella', sourceTemplateId: null, icon: 'stethoscope',
    name: 'Clinical Workstation Kit', tagline: 'Consulting-room PC with NHS Smartcard sign-in.',
    description: 'A compact desk-mounted PC for consulting rooms, with smartcard sign-in and the clinical system pre-installed.',
    audience: 'Clinicians', assignmentTarget: 'user', leadTimeDays: 3,
    lines: [
      line('hw-optiplex-7020'), line('pe-p2425h'), line('pe-smartcard-reader'),
    ],
    recommendedSoftwareIds: ['sw-emis-web', 'sw-accurx'],
    updatedAt: '2026-08-14T08:50:00Z', updatedBy: 'Nadia Hussain',
  },
  {
    id: 'kit-umbrella-clinic-drop', ownerTenantId: 't-umbrella', sourceTemplateId: 'tpl-infrastructure', icon: 'network',
    name: 'Clinic Network Drop', tagline: 'Network stack for a new clinic.',
    description: 'Checkpoint’s standard Infrastructure Drop.',
    audience: 'New clinic', assignmentTarget: 'site', leadTimeDays: 7,
    lines: [
      line('hw-meraki-mx68'), line('hw-meraki-ms130-24p'), line('hw-meraki-mr36', 2),
      line('pe-apc-ups'),
    ],
    recommendedSoftwareIds: [],
    updatedAt: '2026-06-24T13:30:00Z', updatedBy: 'Jordan Blake',
  },

  // --- Northwind Logistics --------------------------------------------------
  {
    id: 'kit-northwind-driver', ownerTenantId: 't-northwind', sourceTemplateId: null, icon: 'truck',
    name: 'Depot Driver Kit', tagline: 'Rugged phone and cab mount for delivery drivers.',
    description: 'A rugged Android phone that opens straight into routing and proof-of-delivery, with a hard-wired cab mount.',
    audience: 'Drivers', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-galaxy-xcover7'), line('pe-vehicle-mount'),
    ],
    recommendedSoftwareIds: ['sw-soti-mobicontrol', 'sw-descartes-route-planner'],
    updatedAt: '2026-09-09T07:40:00Z', updatedBy: 'Callum Fraser',
  },
  {
    id: 'kit-northwind-office', ownerTenantId: 't-northwind', sourceTemplateId: 'tpl-sales', icon: 'headset',
    name: 'Depot Office Kit', tagline: 'Laptop and desk phone for depot coordinators.',
    description: 'A cost-down version of the Sales Kit for depot office staff.',
    audience: 'Depot operations', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-thinkpad-e14-g6'), line('hw-poly-edge-e350'),
    ],
    recommendedSoftwareIds: ['sw-teams-phone'],
    updatedAt: '2026-07-02T12:20:00Z', updatedBy: 'Callum Fraser',
  },
  {
    id: 'kit-forgewright-artist', ownerTenantId: 't-forgewright', sourceTemplateId: null, icon: 'palette',
    name: 'Artist Workstation', tagline: 'GPU workstation and pen display for environment and character artists.',
    description: 'RTX 5000 workstation with 128 GB RAM for large scenes and bakes, a 27" pen display and a 6K reference monitor.',
    audience: 'Art', assignmentTarget: 'user', leadTimeDays: 5,
    lines: [
      line('hw-hp-z4-g5'), line('pe-cintiq-pro-27'), line('pe-u3224kb'), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-maya', 'sw-zbrush', 'sw-substance', 'sw-unreal', 'sw-perforce'],
    updatedAt: '2026-05-18T09:40:00Z', updatedBy: 'Rachel Thornton',
  },
  {
    id: 'kit-forgewright-engineer', ownerTenantId: 't-forgewright', sourceTemplateId: null, icon: 'code',
    name: 'Engine Programmer Workstation', tagline: 'Fast-compile workstation for engine, gameplay and tools programmers.',
    description: '24-core workstation with 96 GB RAM and 10GbE to the Perforce server, plus dual monitors and a headset for stand-ups.',
    audience: 'Engineering', assignmentTarget: 'user', leadTimeDays: 4,
    lines: [
      line('hw-thinkstation-p3'), line('pe-u2724de', 2), line('pe-mx-combo'), line('pe-jabra-evolve2-65'),
    ],
    recommendedSoftwareIds: ['sw-unreal', 'sw-perforce', 'sw-visual-studio', 'sw-rider'],
    updatedAt: '2026-05-18T09:45:00Z', updatedBy: 'Rachel Thornton',
  },
  {
    id: 'kit-forgewright-qa', ownerTenantId: 't-forgewright', sourceTemplateId: null, icon: 'gamepad',
    name: 'QA Test Station', tagline: 'Capture-ready workstation for console and PC test passes.',
    description: 'Records console output for bug reports. Devkits come from the platform holder and connect to the isolated devkit network, so they aren’t part of this kit.',
    audience: 'QA', assignmentTarget: 'user', leadTimeDays: 4,
    lines: [
      line('hw-precision-3680'), line('pe-elgato-4k-pro'), line('pe-u2724de', 2), line('pe-jabra-evolve2-65'),
    ],
    recommendedSoftwareIds: ['sw-unreal', 'sw-perforce'],
    updatedAt: '2026-06-02T11:20:00Z', updatedBy: 'Rachel Thornton',
  },
  {
    id: 'kit-forgewright-producer', ownerTenantId: 't-forgewright', sourceTemplateId: null, icon: 'briefcase',
    name: 'Producer Laptop', tagline: 'Light laptop and dock for producers and client-facing leads.',
    description: 'Travels to publisher reviews; docks to a single monitor in the studio.',
    audience: 'Production', assignmentTarget: 'user', leadTimeDays: 2,
    lines: [
      line('hw-x1-carbon-g12'), line('pe-thunderbolt-dock'), line('pe-u2724de'), line('pe-jabra-evolve2-65'),
    ],
    recommendedSoftwareIds: ['sw-miro', 'sw-confluence'],
    updatedAt: '2026-05-18T09:50:00Z', updatedBy: 'Rachel Thornton',
  },
  {
    id: 'kit-lanternfly-dev', ownerTenantId: 't-lanternfly', sourceTemplateId: null, icon: 'gamepad',
    name: 'Indie Dev Station', tagline: 'Unity workstation for programmers and designers.',
    description: 'Fast enough for Unity builds and local playtests, with two monitors.',
    audience: 'Development', assignmentTarget: 'user', leadTimeDays: 4,
    lines: [
      line('hw-thinkstation-p3'), line('pe-u2724de', 2), line('pe-mx-combo'),
    ],
    recommendedSoftwareIds: ['sw-unity-pro', 'sw-rider', 'sw-parsec-teams'],
    updatedAt: '2026-03-04T10:10:00Z', updatedBy: 'Tom Ashworth',
  },
  {
    id: 'kit-lanternfly-art', ownerTenantId: 't-lanternfly', sourceTemplateId: null, icon: 'palette',
    name: 'Indie Art Station', tagline: 'GPU workstation and pen display for 2D and 3D art.',
    description: 'The same artist workstation the bigger studios use, with a single reference monitor.',
    audience: 'Art', assignmentTarget: 'user', leadTimeDays: 5,
    lines: [
      line('hw-hp-z4-g5'), line('pe-cintiq-pro-27'), line('pe-u2724de'),
    ],
    recommendedSoftwareIds: ['sw-unity-pro', 'sw-blender', 'sw-substance', 'sw-houdini-indie'],
    updatedAt: '2026-03-04T10:15:00Z', updatedBy: 'Tom Ashworth',
  },
];

// ---------------------------------------------------------------------------
// Demo accounts (switchable from the sidebar)
// ---------------------------------------------------------------------------

export const users: SessionUser[] = [
  {
    id: 'u-jordan', name: 'Jordan Blake', initials: 'JB',
    title: 'MSP Administrator', role: 'msp-admin', tenantId: null,
  },
  {
    id: 'u-sarah', name: 'Sarah Whitfield', initials: 'SW',
    title: 'IT Lead · Acme Corp', role: 'client-admin', tenantId: 't-acme',
  },
  {
    id: 'u-hannah', name: 'Hannah Clarke', initials: 'HC',
    title: 'Operations Manager · Initech', role: 'client-admin', tenantId: 't-initech',
  },
  {
    id: 'u-rachel', name: 'Rachel Thornton', initials: 'RT',
    title: 'Studio Director · Forgewright Interactive', role: 'client-admin', tenantId: 't-forgewright',
  },
];

// ---------------------------------------------------------------------------
// Orders (drives "Pending Deployments" and the storefront's recent orders)
// ---------------------------------------------------------------------------

export const orders: Order[] = [
  {
    id: 'o-011', reference: 'CPO-10489', kitId: 'kit-forgewright-artist', tenantId: 't-forgewright', acquisition: 'purchase',
    assignee: 'Eleanor Hughes', requestedBy: 'Rachel Thornton', status: 'processing',
    createdAt: '2026-09-22T10:30:00Z', expectedDelivery: '2026-09-27', startDate: '2026-10-05', shipTo: 'Leeds Studio',
    onboardingId: 'onb-3018',
  },
  {
    id: 'o-010', reference: 'CPO-10488', kitId: 'kit-initech-office-drop', tenantId: 't-initech', acquisition: 'lease',
    assignee: 'Leeds Studio 2', requestedBy: 'Hannah Clarke', status: 'pending-approval',
    createdAt: '2026-09-24T11:30:00Z', expectedDelivery: null, startDate: '2026-10-12', shipTo: 'Leeds Studio 2',
  },
  {
    id: 'o-009', reference: 'CPO-10487', kitId: 'kit-acme-sales', tenantId: 't-acme', acquisition: 'lease',
    assignee: 'Daniel Okafor', requestedBy: 'Sarah Whitfield', status: 'processing',
    createdAt: '2026-09-23T15:10:00Z', expectedDelivery: '2026-09-25', startDate: '2026-09-28', shipTo: 'Manchester HQ',
    notes: 'Replacement for ACME-LT-0157, whose lease ends 6 Nov.',
  },
  {
    id: 'o-008', reference: 'CPO-10486', kitId: 'kit-globex-analyst', tenantId: 't-globex', acquisition: 'purchase',
    assignee: 'Samuel Adeyemi', requestedBy: 'James Holloway', status: 'pending-approval',
    createdAt: '2026-09-24T10:12:00Z', expectedDelivery: null, onboardingId: 'onb-3017',
  },
  {
    id: 'o-007', reference: 'CPO-10485', kitId: 'kit-acme-sales', tenantId: 't-acme', acquisition: 'lease',
    assignee: 'Joanna Pike', requestedBy: 'Sarah Whitfield', status: 'pending-approval',
    createdAt: '2026-09-24T08:47:00Z', expectedDelivery: null, onboardingId: 'onb-3016',
  },
  {
    id: 'o-006', reference: 'CPO-10482', kitId: 'kit-initech-developer', tenantId: 't-initech', acquisition: 'lease',
    assignee: 'Lucy Morgan', requestedBy: 'Hannah Clarke', status: 'processing',
    createdAt: '2026-09-21T14:30:00Z', expectedDelivery: '2026-09-25', onboardingId: 'onb-3013',
  },
  {
    id: 'o-005', reference: 'CPO-10479', kitId: 'kit-acme-sales', tenantId: 't-acme', acquisition: 'lease',
    assignee: 'Tom Brennan', requestedBy: 'Sarah Whitfield', status: 'processing',
    createdAt: '2026-09-22T09:05:00Z', expectedDelivery: '2026-09-25', onboardingId: 'onb-3012',
  },
  {
    id: 'o-004', reference: 'CPO-10477', kitId: 'kit-globex-executive', tenantId: 't-globex', acquisition: 'purchase',
    assignee: 'Oliver Grant', requestedBy: 'James Holloway', status: 'processing',
    createdAt: '2026-09-19T11:40:00Z', expectedDelivery: '2026-09-26', onboardingId: 'onb-3010',
  },
  {
    id: 'o-003', reference: 'CPO-10474', kitId: 'kit-umbrella-clinic-drop', tenantId: 't-umbrella', acquisition: 'lease',
    assignee: 'Bath Clinic', requestedBy: 'Nadia Hussain', status: 'shipped',
    createdAt: '2026-09-18T15:20:00Z', expectedDelivery: '2026-09-26',
  },
  {
    id: 'o-002', reference: 'CPO-10470', kitId: 'kit-acme-sales', tenantId: 't-acme', acquisition: 'lease',
    assignee: 'Megan Doyle', requestedBy: 'Sarah Whitfield', status: 'delivered',
    createdAt: '2026-09-08T10:00:00Z', expectedDelivery: '2026-09-10', onboardingId: 'onb-3004',
  },
  {
    id: 'o-001', reference: 'CPO-10466', kitId: 'kit-globex-client-services', tenantId: 't-globex', acquisition: 'purchase',
    assignee: 'Amara Nwosu', requestedBy: 'James Holloway', status: 'delivered',
    createdAt: '2026-08-26T13:15:00Z', expectedDelivery: '2026-08-28', onboardingId: 'onb-3001',
  },
];

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

/**
 * Invoices are generated from the data above (see features/billing). Seeded ones are paid within a
 * couple of weeks of issue, apart from these, which are still unpaid on MOCK_NOW.
 */
export const UNPAID_INVOICE_PERIODS: Record<string, string[]> = {
  't-acme': ['2026-09'],
  't-initech': ['2026-09'],
  // July is long overdue (past its final notice), so suspension is available.
  't-umbrella': ['2026-07', '2026-09'],
  // August is overdue enough to put the account on hold.
  't-northwind': ['2026-08', '2026-09'],
  't-forgewright': ['2026-09'],
  't-lanternfly': ['2026-09'],
};

/** Seeded invoices that were paid, but late (tenant → period → paid on), so charges appear on a later invoice. */
export const LATE_PAID_INVOICES: Record<string, Record<string, string>> = {
  't-initech': { '2026-06': '2026-07-19' },
};

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const alerts: Alert[] = [
  {
    id: 'a-001', severity: 'critical', title: 'Server offline',
    description: 'ACME-SRV-02 has missed heartbeats since 03:17 UTC. File shares on this host are unavailable.',
    tenantId: 't-acme', deviceId: 'd-009', createdAt: '2026-09-24T03:32:00Z',
  },
  {
    id: 'a-002', severity: 'critical', title: 'Core switch unreachable',
    description: 'NWL-SW-01 at Glasgow Depot stopped responding. 14 downstream clients affected.',
    tenantId: 't-northwind', deviceId: 'd-047', createdAt: '2026-09-24T06:47:00Z',
  },
  {
    id: 'a-003', severity: 'warning', title: 'Device not checked in',
    description: 'UMB-LT-0511 last checked in 5 days ago. Compliance policy will lock it in 48 hours.',
    tenantId: 't-umbrella', deviceId: 'd-036', createdAt: '2026-09-24T09:00:00Z',
  },
  {
    id: 'a-004', severity: 'warning', title: 'Lease ending in 8 days',
    description: 'ACME-PH-2202 reaches the end of its 36-month lease on 2 Oct 2026. No replacement ordered.',
    tenantId: 't-acme', deviceId: 'd-006', createdAt: '2026-09-24T07:00:00Z',
  },
  {
    id: 'a-005', severity: 'warning', title: 'Remote wipe in progress',
    description: 'GLX-MB-0112 lease ended 4 Sep 2026. Wipe is running before courier collection.',
    tenantId: 't-globex', deviceId: 'd-016', createdAt: '2026-09-23T10:12:00Z',
  },
  {
    id: 'a-006', severity: 'warning', title: 'Access point offline',
    description: 'ACME-AP-03 at Sheffield Warehouse went offline. Wi-Fi coverage degraded in Bay 2.',
    tenantId: 't-acme', deviceId: 'd-013', createdAt: '2026-09-22T21:45:00Z',
  },
  {
    id: 'a-007', severity: 'info', title: 'Firmware update available',
    description: 'FortiOS 7.6.2 is available for INT-FW-01. Scheduled for the next maintenance window.',
    tenantId: 't-initech', deviceId: 'd-033', createdAt: '2026-09-23T08:00:00Z',
  },
  {
    id: 'a-008', severity: 'warning', title: 'Perforce volume 91% full',
    description: 'FWG-SRV-01 depot volume has 3.4 TB free. Submits will fail when it fills.',
    tenantId: 't-forgewright', deviceId: 'd-057', createdAt: '2026-09-24T07:30:00Z',
  },
  {
    id: 'a-009', severity: 'warning', title: 'Offsite backup failing',
    description: 'LFG-SRV-01 couldn’t replicate offsite for 2 nights: the storage bucket’s 2 TB quota is full.',
    tenantId: 't-lanternfly', deviceId: 'd-069', createdAt: '2026-09-24T02:15:00Z',
  },
];

// ---------------------------------------------------------------------------
// Offboarding requests
// ---------------------------------------------------------------------------

const STANDARD_ACCOUNT_ACTIONS: AccountAction[] = [
  'block-sign-in',
  'convert-mailbox',
  'transfer-files',
  'remove-licences',
];

export const offboardingRequests: OffboardingRequest[] = [
  {
    id: 'off-2040', reference: 'OFF-2040', tenantId: 't-umbrella', employee: 'Marcus Reid',
    lastWorkingDay: '2026-09-30', accessRevocation: 'end-of-day', returnMethod: 'courier',
    lineManager: 'Nadia Hussain', accountActions: STANDARD_ACCOUNT_ACTIONS,
    deviceActions: [{ deviceId: 'd-036', deviceName: 'UMB-LT-0511', action: 'wipe-return' }],
    status: 'scheduled', licencesEndOn: '2026-10-30', requestedBy: 'Nadia Hussain', createdAt: '2026-09-22T09:30:00Z',
  },
  {
    id: 'off-2038', reference: 'OFF-2038', tenantId: 't-globex', employee: 'Chloe Bennett',
    lastWorkingDay: '2026-09-19', accessRevocation: 'end-of-day', returnMethod: 'drop-off',
    lineManager: 'James Holloway', accountActions: STANDARD_ACCOUNT_ACTIONS,
    deviceActions: [
      { deviceId: 'd-016', deviceName: 'GLX-MB-0112', action: 'wipe-return' },
      { deviceId: 'd-021', deviceName: 'GLX-MOB-0197', action: 'wipe-return' },
    ],
    status: 'in-progress', licencesEndOn: '2026-10-19', requestedBy: 'James Holloway', createdAt: '2026-09-15T14:05:00Z',
  },
  {
    id: 'off-2033', reference: 'OFF-2033', tenantId: 't-acme', employee: 'Liam Hartley',
    lastWorkingDay: '2026-08-28', accessRevocation: 'end-of-day', returnMethod: 'courier',
    lineManager: 'Sarah Whitfield', accountActions: STANDARD_ACCOUNT_ACTIONS,
    deviceActions: [
      { deviceId: 'd-retired-118', deviceName: 'ACME-LT-0118', action: 'wipe-return' },
      { deviceId: 'd-retired-187', deviceName: 'ACME-PH-2187', action: 'wipe-reassign' },
    ],
    status: 'completed', licencesEndOn: '2026-09-27', requestedBy: 'Sarah Whitfield', createdAt: '2026-08-20T11:00:00Z',
  },
];
