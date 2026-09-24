export type DeviceOffboardAction = 'wipe-return' | 'wipe-reassign' | 'retain';

export type OffboardingStatus = 'scheduled' | 'in-progress' | 'completed';

export type AccessRevocation = 'end-of-day' | 'immediately';

export type ReturnMethod = 'courier' | 'drop-off';

export type AccountAction = 'block-sign-in' | 'convert-mailbox' | 'transfer-files' | 'remove-licences';

export interface OffboardingDeviceAction {
  deviceId: string;
  /** Snapshot of the hostname, so history survives the device leaving the fleet. */
  deviceName: string;
  action: DeviceOffboardAction;
}

export interface OffboardingRequest {
  id: string;
  reference: string;
  tenantId: string;
  employee: string;
  lastWorkingDay: string;
  accessRevocation: AccessRevocation;
  /** Null when no device is being returned. */
  returnMethod: ReturnMethod | null;
  lineManager: string | null;
  accountActions: AccountAction[];
  deviceActions: OffboardingDeviceAction[];
  status: OffboardingStatus;
  requestedBy: string;
  createdAt: string;
}
