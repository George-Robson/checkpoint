export type DeviceCategory = 'computer' | 'telephony' | 'server' | 'networking';

export type DeviceType =
  | 'windows-laptop'
  | 'macbook'
  | 'workstation'
  | 'voip-phone'
  | 'smartphone'
  | 'rack-server'
  | 'virtual-instance'
  | 'switch'
  | 'firewall'
  | 'access-point';

export type DeviceStatus = 'active' | 'provisioning' | 'wiping' | 'offline';

export interface Device {
  id: string;
  name: string;
  model: string;
  type: DeviceType;
  category: DeviceCategory;
  tenantId: string;
  assignedUser: string | null;
  status: DeviceStatus;
  ipAddress: string | null;
  macAddress: string;
  location: string;
  leaseStartDate: string;
  leaseEndDate: string;
  lastSeen: string;
}
