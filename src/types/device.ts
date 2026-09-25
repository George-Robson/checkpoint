import type { Acquisition } from './acquisition';

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
  /** Leased (returned at the end of the term) or bought outright and owned by the client. */
  acquisition: Acquisition;
  /** Lease start for leased devices; purchase date for owned ones. */
  termStartDate: string;
  /** Lease end for leased devices; warranty end for owned ones. Either way, when it's due for refresh. */
  termEndDate: string;
  lastSeen: string;
}
