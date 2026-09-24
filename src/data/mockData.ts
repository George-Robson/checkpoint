import type { Alert } from '../types/alert';
import type { CatalogItem, CatalogSpec } from '../types/catalog';
import type { Device, DeviceCategory, DeviceType } from '../types/device';
import type { Kit, KitLine } from '../types/kit';
import type { LicenceAssignment, LicencePool } from '../types/licence';
import type { AccountAction, OffboardingRequest } from '../types/offboarding';
import type { Onboarding } from '../types/onboarding';
import type { Order } from '../types/order';
import type { SessionUser } from '../types/sessionUser';
import type { SoftwareProduct } from '../types/software';
import type { Tenant } from '../types/tenant';

/** Fixed "now" so lease-window and last-seen calculations are deterministic. */
export const MOCK_NOW = '2026-09-24T13:00:00Z';

export const LEASE_TERM_MONTHS = 36;

/** Devices whose lease ends within this many days are flagged for refresh. */
export const REFRESH_WINDOW_DAYS = 90;

/** Licensed for everyone at a client, and always included when onboarding. */
const BASELINE_SOFTWARE = ['sw-m365-bp', 'sw-security-baseline'];

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
    baselineSoftwareIds: BASELINE_SOFTWARE,
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
    baselineSoftwareIds: BASELINE_SOFTWARE,
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
    baselineSoftwareIds: BASELINE_SOFTWARE,
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
    baselineSoftwareIds: BASELINE_SOFTWARE,
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
    baselineSoftwareIds: BASELINE_SOFTWARE,
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

type DeviceSeed = Omit<Device, 'category' | 'leaseEndDate'>;

function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function toDevice(seed: DeviceSeed): Device {
  return {
    ...seed,
    category: CATEGORY_BY_TYPE[seed.type],
    leaseEndDate: addMonths(seed.leaseStartDate, LEASE_TERM_MONTHS),
  };
}

const deviceSeeds: DeviceSeed[] = [
  // --- Acme Corp (10.10.0.0/16) ---------------------------------------------
  {
    id: 'd-001', name: 'ACME-LT-0142', model: 'Dell Latitude 7450', type: 'windows-laptop',
    tenantId: 't-acme', assignedUser: 'Sarah Whitfield', status: 'active',
    ipAddress: '10.10.20.41', macAddress: 'F4:8E:38:A1:3C:52', location: 'Manchester HQ',
    leaseStartDate: '2024-02-12', lastSeen: '2026-09-24T12:48:00Z',
  },
  {
    id: 'd-002', name: 'ACME-LT-0157', model: 'Lenovo ThinkPad T14 Gen 4', type: 'windows-laptop',
    tenantId: 't-acme', assignedUser: 'Daniel Okafor', status: 'active',
    ipAddress: '10.10.20.58', macAddress: '98:FA:9B:4E:11:7C', location: 'Manchester HQ',
    leaseStartDate: '2023-11-06', lastSeen: '2026-09-24T12:51:00Z',
  },
  {
    id: 'd-003', name: 'ACME-MB-0031', model: 'MacBook Pro 14" M3 Pro', type: 'macbook',
    tenantId: 't-acme', assignedUser: 'Priya Raman', status: 'active',
    ipAddress: '10.10.20.73', macAddress: '3C:22:FB:9D:40:E1', location: 'Manchester HQ',
    leaseStartDate: '2024-05-20', lastSeen: '2026-09-24T12:32:00Z',
  },
  {
    id: 'd-004', name: 'ACME-LT-0163', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-acme', assignedUser: 'Tom Brennan', status: 'provisioning',
    ipAddress: null, macAddress: '98:FA:9B:52:07:19', location: 'Sheffield Warehouse',
    leaseStartDate: '2026-09-22', lastSeen: '2026-09-23T16:05:00Z',
  },
  {
    id: 'd-005', name: 'ACME-PH-2201', model: 'Poly Edge E350', type: 'voip-phone',
    tenantId: 't-acme', assignedUser: 'Sarah Whitfield', status: 'active',
    ipAddress: '10.10.40.12', macAddress: '64:16:7F:2A:9C:03', location: 'Manchester HQ',
    leaseStartDate: '2024-02-12', lastSeen: '2026-09-24T12:55:00Z',
  },
  {
    id: 'd-006', name: 'ACME-PH-2202', model: 'Poly Edge E350', type: 'voip-phone',
    tenantId: 't-acme', assignedUser: 'Daniel Okafor', status: 'active',
    ipAddress: '10.10.40.13', macAddress: '64:16:7F:2A:9C:0B', location: 'Manchester HQ',
    leaseStartDate: '2023-10-02', lastSeen: '2026-09-24T12:55:00Z',
  },
  {
    id: 'd-007', name: 'ACME-MOB-0088', model: 'iPhone 15', type: 'smartphone',
    tenantId: 't-acme', assignedUser: 'Priya Raman', status: 'active',
    ipAddress: '10.10.60.44', macAddress: 'F2:6B:3A:19:C4:07', location: 'Manchester HQ',
    leaseStartDate: '2024-06-03', lastSeen: '2026-09-24T12:40:00Z',
  },
  {
    id: 'd-008', name: 'ACME-SRV-01', model: 'Dell PowerEdge R760', type: 'rack-server',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.1.10', macAddress: 'B0:7B:25:3E:8A:10', location: 'Manchester HQ · Comms Room',
    leaseStartDate: '2024-01-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-009', name: 'ACME-SRV-02', model: 'Dell PowerEdge R650', type: 'rack-server',
    tenantId: 't-acme', assignedUser: null, status: 'offline',
    ipAddress: '10.10.1.11', macAddress: 'B0:7B:25:3E:8A:2C', location: 'Manchester HQ · Comms Room',
    leaseStartDate: '2023-12-04', lastSeen: '2026-09-24T03:17:00Z',
  },
  {
    id: 'd-010', name: 'ACME-VM-SQL01', model: 'Azure D8s v5', type: 'virtual-instance',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.100.21', macAddress: '00:0D:3A:6F:21:B8', location: 'Azure UK South',
    leaseStartDate: '2025-03-01', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-011', name: 'ACME-FW-01', model: 'Fortinet FortiGate 100F', type: 'firewall',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.0.1', macAddress: '00:09:0F:FE:21:A4', location: 'Manchester HQ · Comms Room',
    leaseStartDate: '2024-01-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-012', name: 'ACME-SW-01', model: 'Cisco Meraki MS250-48', type: 'switch',
    tenantId: 't-acme', assignedUser: null, status: 'active',
    ipAddress: '10.10.0.2', macAddress: '0C:8D:DB:6A:10:F2', location: 'Manchester HQ · Comms Room',
    leaseStartDate: '2024-01-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-013', name: 'ACME-AP-03', model: 'Cisco Meraki MR46', type: 'access-point',
    tenantId: 't-acme', assignedUser: null, status: 'offline',
    ipAddress: '10.10.0.23', macAddress: '0C:8D:DB:71:3E:05', location: 'Sheffield Warehouse',
    leaseStartDate: '2024-08-19', lastSeen: '2026-09-22T21:40:00Z',
  },

  // --- Globex Solutions (10.20.0.0/16) --------------------------------------
  {
    id: 'd-014', name: 'GLX-LT-0301', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-globex', assignedUser: 'James Holloway', status: 'active',
    ipAddress: '10.20.10.31', macAddress: '98:FA:9B:61:A2:3D', location: 'London HQ',
    leaseStartDate: '2025-01-13', lastSeen: '2026-09-24T12:57:00Z',
  },
  {
    id: 'd-015', name: 'GLX-LT-0302', model: 'Lenovo ThinkPad X1 Carbon Gen 12', type: 'windows-laptop',
    tenantId: 't-globex', assignedUser: 'Amara Nwosu', status: 'active',
    ipAddress: '10.20.10.32', macAddress: '98:FA:9B:61:A2:9F', location: 'London HQ',
    leaseStartDate: '2026-08-28', lastSeen: '2026-09-24T12:44:00Z',
  },
  {
    id: 'd-016', name: 'GLX-MB-0112', model: 'MacBook Air 13" M2', type: 'macbook',
    tenantId: 't-globex', assignedUser: 'Chloe Bennett', status: 'wiping',
    ipAddress: null, macAddress: '3C:22:FB:14:6E:D0', location: 'London HQ',
    leaseStartDate: '2023-09-04', lastSeen: '2026-09-24T11:20:00Z',
  },
  {
    id: 'd-017', name: 'GLX-MB-0118', model: 'MacBook Pro 16" M4 Pro', type: 'macbook',
    tenantId: 't-globex', assignedUser: 'Oliver Grant', status: 'provisioning',
    ipAddress: null, macAddress: '3C:22:FB:88:02:4A', location: 'London HQ',
    leaseStartDate: '2026-09-19', lastSeen: '2026-09-24T09:14:00Z',
  },
  {
    id: 'd-018', name: 'GLX-PH-3104', model: 'Yealink T54W', type: 'voip-phone',
    tenantId: 't-globex', assignedUser: 'James Holloway', status: 'active',
    ipAddress: '10.20.40.104', macAddress: '80:5E:C0:3B:71:0E', location: 'London HQ',
    leaseStartDate: '2025-01-13', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-019', name: 'GLX-PH-3105', model: 'Yealink T54W', type: 'voip-phone',
    tenantId: 't-globex', assignedUser: 'Amara Nwosu', status: 'active',
    ipAddress: '10.20.40.105', macAddress: '80:5E:C0:3B:71:1A', location: 'London HQ',
    leaseStartDate: '2026-08-28', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-020', name: 'GLX-MOB-0204', model: 'iPhone 16 Pro', type: 'smartphone',
    tenantId: 't-globex', assignedUser: 'Oliver Grant', status: 'provisioning',
    ipAddress: null, macAddress: 'A6:1D:4F:90:3C:E2', location: 'London HQ',
    leaseStartDate: '2026-09-19', lastSeen: '2026-09-24T09:10:00Z',
  },
  {
    id: 'd-021', name: 'GLX-MOB-0197', model: 'iPhone 13', type: 'smartphone',
    tenantId: 't-globex', assignedUser: 'Chloe Bennett', status: 'wiping',
    ipAddress: null, macAddress: 'DA:47:0B:2E:95:61', location: 'London HQ',
    leaseStartDate: '2023-09-04', lastSeen: '2026-09-24T11:22:00Z',
  },
  {
    id: 'd-022', name: 'GLX-SRV-01', model: 'HPE ProLiant DL380 Gen11', type: 'rack-server',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.1.10', macAddress: '94:40:C9:5D:17:B3', location: 'London HQ · Server Room',
    leaseStartDate: '2024-07-01', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-023', name: 'GLX-VM-APP02', model: 'AWS EC2 m6i.xlarge', type: 'virtual-instance',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.100.32', macAddress: '0A:3F:9C:12:7B:44', location: 'AWS eu-west-2',
    leaseStartDate: '2025-06-16', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-024', name: 'GLX-FW-01', model: 'Palo Alto PA-440', type: 'firewall',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.0.1', macAddress: 'B4:0C:25:E0:4F:18', location: 'London HQ · Server Room',
    leaseStartDate: '2024-07-01', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-025', name: 'GLX-AP-07', model: 'Cisco Meraki MR56', type: 'access-point',
    tenantId: 't-globex', assignedUser: null, status: 'active',
    ipAddress: '10.20.0.27', macAddress: '0C:8D:DB:92:6C:31', location: 'Birmingham Office',
    leaseStartDate: '2023-11-27', lastSeen: '2026-09-24T12:59:00Z',
  },

  // --- Initech (172.16.0.0/16) ----------------------------------------------
  {
    id: 'd-026', name: 'INT-WS-0012', model: 'Dell Precision 3680 Tower', type: 'workstation',
    tenantId: 't-initech', assignedUser: 'Ravi Patel', status: 'active',
    ipAddress: '172.16.10.12', macAddress: 'F4:8E:38:C7:5A:21', location: 'Leeds Studio',
    leaseStartDate: '2024-09-09', lastSeen: '2026-09-24T12:46:00Z',
  },
  {
    id: 'd-027', name: 'INT-WS-0015', model: 'Dell Precision 3680 Tower', type: 'workstation',
    tenantId: 't-initech', assignedUser: 'Grace Liu', status: 'active',
    ipAddress: '172.16.10.15', macAddress: 'F4:8E:38:C7:5A:6E', location: 'Leeds Studio',
    leaseStartDate: '2023-10-16', lastSeen: '2026-09-24T12:50:00Z',
  },
  {
    id: 'd-028', name: 'INT-MB-0044', model: 'MacBook Pro 16" M4 Max', type: 'macbook',
    tenantId: 't-initech', assignedUser: 'Ethan Walsh', status: 'active',
    ipAddress: '172.16.10.44', macAddress: '3C:22:FB:A3:19:5C', location: 'Leeds Studio',
    leaseStartDate: '2025-02-03', lastSeen: '2026-09-24T12:37:00Z',
  },
  {
    id: 'd-029', name: 'INT-WS-0019', model: 'Dell Precision 5690', type: 'workstation',
    tenantId: 't-initech', assignedUser: 'Lucy Morgan', status: 'provisioning',
    ipAddress: null, macAddress: 'F4:8E:38:D1:08:93', location: 'Leeds Studio',
    leaseStartDate: '2026-09-21', lastSeen: '2026-09-24T08:30:00Z',
  },
  {
    id: 'd-030', name: 'INT-LT-0021', model: 'HP EliteBook 840 G11', type: 'windows-laptop',
    tenantId: 't-initech', assignedUser: 'Hannah Clarke', status: 'active',
    ipAddress: '172.16.10.21', macAddress: '5C:60:BA:2F:44:D7', location: 'Leeds Studio',
    leaseStartDate: '2024-04-15', lastSeen: '2026-09-24T12:53:00Z',
  },
  {
    id: 'd-031', name: 'INT-PH-0405', model: 'Poly CCX 400', type: 'voip-phone',
    tenantId: 't-initech', assignedUser: 'Hannah Clarke', status: 'active',
    ipAddress: '172.16.40.5', macAddress: '64:16:7F:4C:12:A8', location: 'Leeds Studio',
    leaseStartDate: '2024-04-15', lastSeen: '2026-09-24T12:53:00Z',
  },
  {
    id: 'd-032', name: 'INT-VM-CI01', model: 'Azure D16s v5', type: 'virtual-instance',
    tenantId: 't-initech', assignedUser: null, status: 'active',
    ipAddress: '172.16.100.11', macAddress: '00:0D:3A:B4:5E:02', location: 'Azure UK South',
    leaseStartDate: '2025-08-04', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-033', name: 'INT-FW-01', model: 'Fortinet FortiGate 60F', type: 'firewall',
    tenantId: 't-initech', assignedUser: null, status: 'active',
    ipAddress: '172.16.0.1', macAddress: '00:09:0F:AA:81:3D', location: 'Leeds Studio · Comms Cabinet',
    leaseStartDate: '2024-04-15', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-034', name: 'INT-SW-01', model: 'Cisco Meraki MS130-24P', type: 'switch',
    tenantId: 't-initech', assignedUser: null, status: 'active',
    ipAddress: '172.16.0.2', macAddress: '0C:8D:DB:A5:33:7E', location: 'Leeds Studio · Comms Cabinet',
    leaseStartDate: '2024-04-15', lastSeen: '2026-09-24T12:59:00Z',
  },

  // --- Umbrella Health (10.40.0.0/16) ---------------------------------------
  {
    id: 'd-035', name: 'UMB-LT-0510', model: 'Dell Latitude 5450', type: 'windows-laptop',
    tenantId: 't-umbrella', assignedUser: 'Dr. Emily Shaw', status: 'active',
    ipAddress: '10.40.20.50', macAddress: 'F4:8E:38:E2:6B:14', location: 'Bristol Clinic',
    leaseStartDate: '2025-05-12', lastSeen: '2026-09-24T12:42:00Z',
  },
  {
    id: 'd-036', name: 'UMB-LT-0511', model: 'Dell Latitude 5450', type: 'windows-laptop',
    tenantId: 't-umbrella', assignedUser: 'Marcus Reid', status: 'offline',
    ipAddress: '10.40.20.51', macAddress: 'F4:8E:38:E2:6B:3A', location: 'Bristol Clinic',
    leaseStartDate: '2025-05-12', lastSeen: '2026-09-19T17:26:00Z',
  },
  {
    id: 'd-037', name: 'UMB-LT-0498', model: 'Dell Latitude 5440', type: 'windows-laptop',
    tenantId: 't-umbrella', assignedUser: 'Nadia Hussain', status: 'active',
    ipAddress: '10.40.20.38', macAddress: 'F4:8E:38:9A:10:C5', location: 'Bristol Clinic',
    leaseStartDate: '2023-12-11', lastSeen: '2026-09-24T12:39:00Z',
  },
  {
    id: 'd-038', name: 'UMB-PH-0620', model: 'Yealink T46U', type: 'voip-phone',
    tenantId: 't-umbrella', assignedUser: null, status: 'active',
    ipAddress: '10.40.40.20', macAddress: '80:5E:C0:7D:22:9B', location: 'Bristol Clinic · Reception',
    leaseStartDate: '2024-03-04', lastSeen: '2026-09-24T12:58:00Z',
  },
  {
    id: 'd-039', name: 'UMB-MOB-0302', model: 'iPhone 15', type: 'smartphone',
    tenantId: 't-umbrella', assignedUser: 'Dr. Emily Shaw', status: 'active',
    ipAddress: '10.40.60.12', macAddress: 'C6:91:5A:0E:7F:33', location: 'Bristol Clinic',
    leaseStartDate: '2025-05-12', lastSeen: '2026-09-24T12:15:00Z',
  },
  {
    id: 'd-040', name: 'UMB-SRV-01', model: 'Lenovo ThinkSystem SR650 V3', type: 'rack-server',
    tenantId: 't-umbrella', assignedUser: null, status: 'active',
    ipAddress: '10.40.1.10', macAddress: '08:3A:88:5B:C0:71', location: 'Bristol Clinic · Server Room',
    leaseStartDate: '2024-03-04', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-041', name: 'UMB-FW-01', model: 'Fortinet FortiGate 100F', type: 'firewall',
    tenantId: 't-umbrella', assignedUser: null, status: 'active',
    ipAddress: '10.40.0.1', macAddress: '00:09:0F:BC:47:E9', location: 'Bristol Clinic · Server Room',
    leaseStartDate: '2024-03-04', lastSeen: '2026-09-24T12:59:00Z',
  },
  {
    id: 'd-042', name: 'UMB-AP-02', model: 'Cisco Meraki MR36', type: 'access-point',
    tenantId: 't-umbrella', assignedUser: null, status: 'provisioning',
    ipAddress: null, macAddress: '0C:8D:DB:B8:0D:52', location: 'Bath Clinic',
    leaseStartDate: '2026-09-20', lastSeen: '2026-09-20T14:02:00Z',
  },

  // --- Northwind Logistics (192.168.0.0/16) ---------------------------------
  {
    id: 'd-043', name: 'NWL-LT-0071', model: 'Lenovo ThinkPad E14 Gen 6', type: 'windows-laptop',
    tenantId: 't-northwind', assignedUser: 'Callum Fraser', status: 'active',
    ipAddress: '192.168.10.71', macAddress: '98:FA:9B:77:E1:08', location: 'Edinburgh Depot',
    leaseStartDate: '2025-10-06', lastSeen: '2026-09-24T12:30:00Z',
  },
  {
    id: 'd-044', name: 'NWL-LT-0074', model: 'Lenovo ThinkPad E14 Gen 5', type: 'windows-laptop',
    tenantId: 't-northwind', assignedUser: 'Isla Robertson', status: 'active',
    ipAddress: '192.168.10.74', macAddress: '98:FA:9B:3C:5D:B2', location: 'Edinburgh Depot',
    leaseStartDate: '2023-10-23', lastSeen: '2026-09-24T12:21:00Z',
  },
  {
    id: 'd-045', name: 'NWL-MOB-0130', model: 'Samsung Galaxy XCover7', type: 'smartphone',
    tenantId: 't-northwind', assignedUser: 'Callum Fraser', status: 'active',
    ipAddress: '192.168.60.30', macAddress: '5E:B2:18:C9:04:7A', location: 'Edinburgh Depot',
    leaseStartDate: '2025-10-06', lastSeen: '2026-09-24T11:58:00Z',
  },
  {
    id: 'd-046', name: 'NWL-MOB-0131', model: 'Samsung Galaxy XCover7', type: 'smartphone',
    tenantId: 't-northwind', assignedUser: 'Jamie Stewart', status: 'offline',
    ipAddress: '192.168.60.31', macAddress: '5E:B2:18:C9:04:9F', location: 'Glasgow Depot',
    leaseStartDate: '2026-09-12', lastSeen: '2026-09-23T18:44:00Z',
  },
  {
    id: 'd-047', name: 'NWL-SW-01', model: 'Cisco Meraki MS120-24', type: 'switch',
    tenantId: 't-northwind', assignedUser: null, status: 'offline',
    ipAddress: '192.168.20.2', macAddress: '0C:8D:DB:C4:19:E6', location: 'Glasgow Depot',
    leaseStartDate: '2025-10-06', lastSeen: '2026-09-24T06:42:00Z',
  },
  {
    id: 'd-048', name: 'NWL-FW-01', model: 'Cisco Meraki MX68', type: 'firewall',
    tenantId: 't-northwind', assignedUser: null, status: 'active',
    ipAddress: '192.168.10.1', macAddress: '0C:8D:DB:C4:02:11', location: 'Edinburgh Depot',
    leaseStartDate: '2025-10-06', lastSeen: '2026-09-24T12:59:00Z',
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
    name: 'Dell Precision 5690', detail: '16" mobile workstation', monthlyPrice: 98,
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
    name: 'Dell Precision 3680 Tower', detail: 'Tower workstation · monitors not included', monthlyPrice: 84,
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
    name: 'Dell OptiPlex 7020 Micro', detail: 'Ultra-compact desktop · monitor not included', monthlyPrice: 26,
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
    name: 'MacBook Pro 16" M4 Max', detail: '16" pro laptop', monthlyPrice: 132,
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
    name: 'MacBook Pro 16" M4 Pro', detail: '16" pro laptop', monthlyPrice: 104,
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
    name: 'MacBook Air 13" M3', detail: '13" everyday laptop', monthlyPrice: 44,
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
    name: 'Lenovo ThinkPad X1 Carbon Gen 12', detail: '14" ultraportable laptop', monthlyPrice: 62,
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
    name: 'Dell Latitude 5450', detail: '14" business laptop', monthlyPrice: 36,
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
    name: 'Lenovo ThinkPad E14 Gen 6', detail: '14" essentials laptop', monthlyPrice: 29,
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
    name: 'Poly Edge E350', detail: 'VoIP desk phone · auto-provisioned extension', monthlyPrice: 9,
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
    name: 'Yealink T54W', detail: 'VoIP desk phone · auto-provisioned extension', monthlyPrice: 8,
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
    name: 'iPhone 16 Pro', detail: 'Smartphone · supervised via Apple Business Manager', monthlyPrice: 46,
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
    name: 'iPhone 15', detail: 'Smartphone · supervised via Apple Business Manager', monthlyPrice: 28,
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
    name: 'Samsung Galaxy XCover7', detail: 'Rugged smartphone · Android Enterprise', monthlyPrice: 21,
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
    name: 'Zebra TC58 handheld', detail: 'Rugged mobile computer · Android Enterprise', monthlyPrice: 38,
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
    name: 'Cisco Meraki MX68', detail: 'Cloud-managed firewall and SD-WAN', monthlyPrice: 58,
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
    name: 'Fortinet FortiGate 60F', detail: 'Next-generation firewall', monthlyPrice: 49,
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
    name: 'Cisco Meraki MS130-24P', detail: 'Cloud-managed access switch', monthlyPrice: 42,
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
    name: 'Cisco Meraki MR36', detail: 'Indoor Wi-Fi 6 access point', monthlyPrice: 16,
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
    name: 'Dell UltraSharp U2724DE', detail: '27" QHD · USB-C hub · 90 W charging', monthlyPrice: 9,
    image: '/catalog/photos/pe-u2724de.webp',
  },
  {
    id: 'pe-p2425h', kind: 'peripheral', vendor: 'Dell',
    name: 'Dell P2425H', detail: '24" Full HD · height adjustable', monthlyPrice: 5,
    image: '/catalog/photos/pe-p2425h.webp',
  },
  {
    id: 'pe-studio-display', kind: 'peripheral', vendor: 'Apple',
    name: 'Apple Studio Display', detail: '27" 5K Retina · tilt-adjustable stand', monthlyPrice: 24,
    image: '/catalog/photos/pe-studio-display.webp',
  },
  {
    id: 'pe-thunderbolt-dock', kind: 'peripheral', vendor: 'Dell',
    name: 'Dell Thunderbolt Dock WD22TB4', detail: 'Single-cable desk setup · 130 W', monthlyPrice: 6,
    image: '/catalog/photos/pe-thunderbolt-dock.webp',
  },
  {
    id: 'pe-mx-combo', kind: 'peripheral', vendor: 'Logitech',
    name: 'Logitech MX Keys S & MX Master 3S', detail: 'Wireless keyboard and mouse combo', monthlyPrice: 3,
    image: '/catalog/photos/pe-mx-combo.webp',
  },
  {
    id: 'pe-jabra-evolve2-65', kind: 'peripheral', vendor: 'Jabra',
    name: 'Jabra Evolve2 65', detail: 'Wireless ANC headset · Teams certified', monthlyPrice: 5,
    image: '/catalog/photos/pe-jabra-evolve2-65.webp',
  },
  {
    id: 'pe-smartcard-reader', kind: 'peripheral', vendor: 'HID',
    name: 'HID OMNIKEY 3121 reader', detail: 'NHS Smartcard reader · USB', monthlyPrice: 1,
    image: '/catalog/photos/pe-smartcard-reader.webp',
  },
  {
    id: 'pe-zebra-cradle', kind: 'peripheral', vendor: 'Zebra',
    name: 'Zebra charging cradle', detail: 'Single-slot charge & sync cradle', monthlyPrice: 3,
    image: '/catalog/photos/pe-zebra-cradle.webp',
  },
  {
    id: 'pe-vehicle-mount', kind: 'peripheral', vendor: 'Brodit',
    name: 'Brodit vehicle mount & charger', detail: 'Hard-wired cradle for cab use', monthlyPrice: 3,
    image: '/catalog/photos/pe-vehicle-mount.webp',
  },
  {
    id: 'pe-apc-ups', kind: 'peripheral', vendor: 'APC',
    name: 'APC Back-UPS Pro 1500', detail: 'Rack-mount UPS for network cabinet', monthlyPrice: 11,
    image: '/catalog/photos/pe-apc-ups.webp',
  },
];

// ---------------------------------------------------------------------------
// Software catalogue (licensed per person, separately from hardware)
// ---------------------------------------------------------------------------

export const softwareProducts: SoftwareProduct[] = [
  {
    id: 'sw-m365-bp', name: 'Microsoft 365 Business Premium', vendor: 'Microsoft', category: 'productivity',
    detail: 'Outlook, Teams, OneDrive, Office apps, Entra ID P1, Intune', monthlyPricePerSeat: 18,
  },
  {
    id: 'sw-security-baseline', name: 'Endpoint Security Baseline', vendor: 'Microsoft', category: 'security',
    detail: 'Defender for Endpoint, BitLocker / FileVault, Intune compliance', monthlyPricePerSeat: 7,
  },
  {
    id: 'sw-exec-security', name: 'Executive Security Profile', vendor: 'Checkpoint', category: 'security',
    detail: 'Conditional access, phishing-resistant MFA, priority support', monthlyPricePerSeat: 9,
  },
  {
    id: 'sw-ide-toolchain', name: 'IDE Toolchain', vendor: 'Checkpoint', category: 'development',
    detail: 'VS Code, JetBrains Toolbox, Docker Desktop, Git', monthlyPricePerSeat: 6,
  },
  {
    id: 'sw-developer-access', name: 'Developer Access Policy', vendor: 'Checkpoint', category: 'development',
    detail: 'GitHub SSO, always-on VPN, just-in-time local admin', monthlyPricePerSeat: 4,
  },
  {
    id: 'sw-cad-suite', name: 'CAD Suite', vendor: 'Autodesk', category: 'line-of-business',
    detail: 'AutoCAD, Inventor, Vault client', monthlyPricePerSeat: 38,
  },
  {
    id: 'sw-crm-suite', name: 'CRM Suite', vendor: 'Salesforce', category: 'sales',
    detail: 'Salesforce Sales Cloud, HubSpot Sales Hub, Gong', monthlyPricePerSeat: 14,
  },
  {
    id: 'sw-teams-phone', name: 'Teams Phone', vendor: 'Microsoft', category: 'communications',
    detail: 'UK calling plan · auto-attendant ready', monthlyPricePerSeat: 8,
  },
  {
    id: 'sw-call-recording', name: 'Compliance Call Recording', vendor: 'Checkpoint', category: 'communications',
    detail: 'FCA-compliant recording for voice and Teams', monthlyPricePerSeat: 11,
  },
  {
    id: 'sw-market-data', name: 'Market Data Terminal', vendor: 'Bloomberg', category: 'line-of-business',
    detail: 'Bloomberg Anywhere, Refinitiv Workspace', monthlyPricePerSeat: 48,
  },
  {
    id: 'sw-clinical-apps', name: 'Clinical Apps Profile', vendor: 'Checkpoint', category: 'line-of-business',
    detail: 'EMIS Web, NHS Smartcard middleware, Accurx', monthlyPricePerSeat: 12,
  },
  {
    id: 'sw-kiosk-mode', name: 'Rugged Device Kiosk Profile', vendor: 'Checkpoint', category: 'security',
    detail: 'Android Enterprise dedicated device, locked launcher', monthlyPricePerSeat: 4,
  },
  {
    id: 'sw-warehouse-wms', name: 'Warehouse Scanning App', vendor: 'Checkpoint', category: 'line-of-business',
    detail: 'WMS client for picking, put-away and stock counts', monthlyPricePerSeat: 6,
  },
  {
    id: 'sw-route-pod', name: 'Route & Proof-of-Delivery App', vendor: 'Checkpoint', category: 'line-of-business',
    detail: 'Driver routing, e-signature capture, photo POD', monthlyPricePerSeat: 7,
  },
];

// ---------------------------------------------------------------------------
// Onboardings (new hires: optional hardware kit + software licences)
// ---------------------------------------------------------------------------

export const onboardings: Onboarding[] = [
  {
    id: 'onb-3017', reference: 'ONB-3017', tenantId: 't-globex', person: 'Samuel Adeyemi', jobTitle: 'Equity Analyst',
    startDate: '2026-10-12', kitId: 'kit-globex-analyst', orderId: 'o-008',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-market-data', 'sw-call-recording'],
    status: 'scheduled', requestedBy: 'James Holloway', createdAt: '2026-09-24T10:12:00Z',
  },
  {
    id: 'onb-3016', reference: 'ONB-3016', tenantId: 't-acme', person: 'Joanna Pike', jobTitle: 'Account Executive',
    startDate: '2026-10-05', kitId: 'kit-acme-sales', orderId: 'o-007',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-teams-phone'],
    status: 'scheduled', requestedBy: 'Sarah Whitfield', createdAt: '2026-09-24T08:47:00Z',
  },
  {
    id: 'onb-3013', reference: 'ONB-3013', tenantId: 't-initech', person: 'Lucy Morgan', jobTitle: 'Platform Engineer',
    startDate: '2026-09-28', kitId: 'kit-initech-developer', orderId: 'o-006',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-ide-toolchain', 'sw-developer-access'],
    status: 'in-progress', requestedBy: 'Hannah Clarke', createdAt: '2026-09-21T14:30:00Z',
  },
  {
    id: 'onb-3012', reference: 'ONB-3012', tenantId: 't-acme', person: 'Tom Brennan', jobTitle: 'Area Sales Manager',
    startDate: '2026-09-28', kitId: 'kit-acme-sales', orderId: 'o-005',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-teams-phone'],
    status: 'in-progress', requestedBy: 'Sarah Whitfield', createdAt: '2026-09-22T09:05:00Z',
  },
  {
    id: 'onb-3010', reference: 'ONB-3010', tenantId: 't-globex', person: 'Oliver Grant', jobTitle: 'Managing Director',
    startDate: '2026-09-29', kitId: 'kit-globex-executive', orderId: 'o-004',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-exec-security', 'sw-call-recording'],
    status: 'in-progress', requestedBy: 'James Holloway', createdAt: '2026-09-19T11:40:00Z',
  },
  {
    id: 'onb-3004', reference: 'ONB-3004', tenantId: 't-acme', person: 'Megan Doyle', jobTitle: 'Inside Sales Representative',
    startDate: '2026-09-14', kitId: 'kit-acme-sales', orderId: 'o-002',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-teams-phone'],
    status: 'completed', requestedBy: 'Sarah Whitfield', createdAt: '2026-09-08T10:00:00Z',
  },
  {
    id: 'onb-3001', reference: 'ONB-3001', tenantId: 't-globex', person: 'Amara Nwosu', jobTitle: 'Client Services Associate',
    startDate: '2026-09-01', kitId: 'kit-globex-client-services', orderId: 'o-001',
    softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-call-recording'],
    status: 'completed', requestedBy: 'James Holloway', createdAt: '2026-08-26T13:15:00Z',
  },
];

// ---------------------------------------------------------------------------
// Licences: seat pools per client and who holds each seat
// ---------------------------------------------------------------------------

/** Existing staff and what they're licensed for (new hires come from onboardings above). */
const licensedStaff: { tenantId: string; person: string; softwareIds: string[]; since: string }[] = [
  { tenantId: 't-acme', person: 'Sarah Whitfield', since: '2023-06-12', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-teams-phone'] },
  { tenantId: 't-acme', person: 'Daniel Okafor', since: '2023-11-06', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-teams-phone'] },
  { tenantId: 't-acme', person: 'Priya Raman', since: '2024-05-20', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-cad-suite'] },
  { tenantId: 't-acme', person: 'Megan Doyle', since: '2026-09-14', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-teams-phone'] },
  { tenantId: 't-globex', person: 'James Holloway', since: '2023-04-03', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-call-recording', 'sw-exec-security'] },
  { tenantId: 't-globex', person: 'Amara Nwosu', since: '2026-09-01', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-call-recording'] },
  { tenantId: 't-globex', person: 'Chloe Bennett', since: '2023-09-04', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-crm-suite', 'sw-call-recording'] },
  { tenantId: 't-initech', person: 'Hannah Clarke', since: '2024-04-01', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-teams-phone'] },
  { tenantId: 't-initech', person: 'Ravi Patel', since: '2024-09-09', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-ide-toolchain', 'sw-developer-access'] },
  { tenantId: 't-initech', person: 'Grace Liu', since: '2024-04-15', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-ide-toolchain', 'sw-developer-access'] },
  { tenantId: 't-initech', person: 'Ethan Walsh', since: '2025-02-03', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-ide-toolchain', 'sw-developer-access'] },
  { tenantId: 't-umbrella', person: 'Nadia Hussain', since: '2024-02-19', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-clinical-apps'] },
  { tenantId: 't-umbrella', person: 'Dr. Emily Shaw', since: '2025-05-12', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-clinical-apps'] },
  { tenantId: 't-umbrella', person: 'Marcus Reid', since: '2025-05-12', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-clinical-apps'] },
  { tenantId: 't-northwind', person: 'Callum Fraser', since: '2025-09-22', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-teams-phone'] },
  { tenantId: 't-northwind', person: 'Isla Robertson', since: '2025-10-06', softwareIds: ['sw-m365-bp', 'sw-security-baseline', 'sw-teams-phone'] },
  { tenantId: 't-northwind', person: 'Jamie Stewart', since: '2026-09-12', softwareIds: ['sw-kiosk-mode', 'sw-route-pod'] },
];

export const licenceAssignments: LicenceAssignment[] = [
  ...licensedStaff.flatMap((staff) =>
    staff.softwareIds.map((softwareId) => ({
      id: `la-${staff.tenantId}-${softwareId}-${staff.person}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      tenantId: staff.tenantId, softwareId, person: staff.person,
      status: 'active' as const, startsOn: null,
      assignedAt: `${staff.since}T09:00:00Z`, assignedBy: 'Jordan Blake',
    })),
  ),
  ...onboardings
    .filter((onboarding) => onboarding.status !== 'completed')
    .flatMap((onboarding) =>
      onboarding.softwareIds.map((softwareId) => ({
        id: `la-${onboarding.tenantId}-${softwareId}-${onboarding.person}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        tenantId: onboarding.tenantId, softwareId, person: onboarding.person,
        status: 'scheduled' as const, startsOn: onboarding.startDate,
        assignedAt: onboarding.createdAt, assignedBy: onboarding.requestedBy,
      })),
    ),
];

/** Unassigned seats per pool (default 1). 0 = full; larger numbers show unused spend. */
const SPARE_SEATS: Record<string, number> = {
  'sw-m365-bp': 3,
  't-acme:sw-cad-suite': 0,
  't-globex:sw-market-data': 0,
  't-initech:sw-ide-toolchain': 0,
  't-umbrella:sw-clinical-apps': 2,
};

/** Seats bought but not used by anyone (wasted spend to review). */
const UNUSED_POOLS: { tenantId: string; softwareId: string; seats: number }[] = [
  { tenantId: 't-globex', softwareId: 'sw-teams-phone', seats: 5 },
  { tenantId: 't-acme', softwareId: 'sw-exec-security', seats: 2 },
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
    seats: count + (SPARE_SEATS[`${tenant.id}:${softwareId}`] ?? SPARE_SEATS[softwareId] ?? 1),
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
    recommendedSoftwareIds: ['sw-ide-toolchain', 'sw-developer-access'],
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
    recommendedSoftwareIds: ['sw-crm-suite', 'sw-teams-phone'],
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
    recommendedSoftwareIds: ['sw-exec-security'],
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
    recommendedSoftwareIds: ['sw-crm-suite', 'sw-teams-phone'],
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
    recommendedSoftwareIds: ['sw-cad-suite'],
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
    recommendedSoftwareIds: ['sw-kiosk-mode', 'sw-warehouse-wms'],
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
    recommendedSoftwareIds: ['sw-crm-suite', 'sw-call-recording'],
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
    recommendedSoftwareIds: ['sw-market-data', 'sw-call-recording'],
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
    recommendedSoftwareIds: ['sw-exec-security', 'sw-call-recording'],
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
    recommendedSoftwareIds: ['sw-ide-toolchain', 'sw-developer-access'],
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
    recommendedSoftwareIds: ['sw-ide-toolchain', 'sw-developer-access'],
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
    recommendedSoftwareIds: ['sw-clinical-apps'],
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
    recommendedSoftwareIds: ['sw-kiosk-mode', 'sw-route-pod'],
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
];

// ---------------------------------------------------------------------------
// Orders (drives "Pending Deployments" and the storefront's recent orders)
// ---------------------------------------------------------------------------

export const orders: Order[] = [
  {
    id: 'o-008', reference: 'CPO-10486', kitId: 'kit-globex-analyst', tenantId: 't-globex',
    assignee: 'Samuel Adeyemi', requestedBy: 'James Holloway', status: 'pending-approval',
    createdAt: '2026-09-24T10:12:00Z', expectedDelivery: null,
  },
  {
    id: 'o-007', reference: 'CPO-10485', kitId: 'kit-acme-sales', tenantId: 't-acme',
    assignee: 'Joanna Pike', requestedBy: 'Sarah Whitfield', status: 'pending-approval',
    createdAt: '2026-09-24T08:47:00Z', expectedDelivery: null,
  },
  {
    id: 'o-006', reference: 'CPO-10482', kitId: 'kit-initech-developer', tenantId: 't-initech',
    assignee: 'Lucy Morgan', requestedBy: 'Hannah Clarke', status: 'processing',
    createdAt: '2026-09-21T14:30:00Z', expectedDelivery: '2026-09-25',
  },
  {
    id: 'o-005', reference: 'CPO-10479', kitId: 'kit-acme-sales', tenantId: 't-acme',
    assignee: 'Tom Brennan', requestedBy: 'Sarah Whitfield', status: 'processing',
    createdAt: '2026-09-22T09:05:00Z', expectedDelivery: '2026-09-25',
  },
  {
    id: 'o-004', reference: 'CPO-10477', kitId: 'kit-globex-executive', tenantId: 't-globex',
    assignee: 'Oliver Grant', requestedBy: 'James Holloway', status: 'processing',
    createdAt: '2026-09-19T11:40:00Z', expectedDelivery: '2026-09-26',
  },
  {
    id: 'o-003', reference: 'CPO-10474', kitId: 'kit-umbrella-clinic-drop', tenantId: 't-umbrella',
    assignee: 'Bath Clinic', requestedBy: 'Nadia Hussain', status: 'shipped',
    createdAt: '2026-09-18T15:20:00Z', expectedDelivery: '2026-09-26',
  },
  {
    id: 'o-002', reference: 'CPO-10470', kitId: 'kit-acme-sales', tenantId: 't-acme',
    assignee: 'Megan Doyle', requestedBy: 'Sarah Whitfield', status: 'delivered',
    createdAt: '2026-09-08T10:00:00Z', expectedDelivery: '2026-09-10',
  },
  {
    id: 'o-001', reference: 'CPO-10466', kitId: 'kit-globex-client-services', tenantId: 't-globex',
    assignee: 'Amara Nwosu', requestedBy: 'James Holloway', status: 'delivered',
    createdAt: '2026-08-26T13:15:00Z', expectedDelivery: '2026-08-28',
  },
];

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
    status: 'scheduled', requestedBy: 'Nadia Hussain', createdAt: '2026-09-22T09:30:00Z',
  },
  {
    id: 'off-2038', reference: 'OFF-2038', tenantId: 't-globex', employee: 'Chloe Bennett',
    lastWorkingDay: '2026-09-19', accessRevocation: 'end-of-day', returnMethod: 'drop-off',
    lineManager: 'James Holloway', accountActions: STANDARD_ACCOUNT_ACTIONS,
    deviceActions: [
      { deviceId: 'd-016', deviceName: 'GLX-MB-0112', action: 'wipe-return' },
      { deviceId: 'd-021', deviceName: 'GLX-MOB-0197', action: 'wipe-return' },
    ],
    status: 'in-progress', requestedBy: 'James Holloway', createdAt: '2026-09-15T14:05:00Z',
  },
  {
    id: 'off-2033', reference: 'OFF-2033', tenantId: 't-acme', employee: 'Liam Hartley',
    lastWorkingDay: '2026-08-28', accessRevocation: 'end-of-day', returnMethod: 'courier',
    lineManager: 'Sarah Whitfield', accountActions: STANDARD_ACCOUNT_ACTIONS,
    deviceActions: [
      { deviceId: 'd-retired-118', deviceName: 'ACME-LT-0118', action: 'wipe-return' },
      { deviceId: 'd-retired-187', deviceName: 'ACME-PH-2187', action: 'wipe-reassign' },
    ],
    status: 'completed', requestedBy: 'Sarah Whitfield', createdAt: '2026-08-20T11:00:00Z',
  },
];
