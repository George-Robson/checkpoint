import type { AccessRevocation, AccountAction, DeviceOffboardAction, ReturnMethod } from '../../../types/offboarding';

export interface OffboardingFormValues {
  lastWorkingDay: string;
  accessRevocation: AccessRevocation;
  /** Keyed by device id. */
  deviceActions: Record<string, DeviceOffboardAction>;
  returnMethod: ReturnMethod;
  accountActions: Record<AccountAction, boolean>;
  lineManager: string;
  /** Acknowledgement that wipes are irreversible. */
  confirmed: boolean;
}

export type OffboardingFormErrors = Partial<Record<'lastWorkingDay' | 'lineManager' | 'confirmed', string>>;
