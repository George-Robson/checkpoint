import type { Device } from '../../../types/device';

/** A person derived from device assignments (the mock has no separate directory). */
export interface Employee {
  /** `${tenantId}:${name}`, unique across tenants. */
  key: string;
  name: string;
  tenantId: string;
  devices: Device[];
  /** Site of their first assigned device, used for drop-off returns. */
  primarySite: string;
}
