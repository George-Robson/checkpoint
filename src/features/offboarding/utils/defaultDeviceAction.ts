import { getNow } from '../../../lib/date';
import { daysUntilTermEnd } from '../../../lib/deviceTerm';
import type { Device } from '../../../types/device';
import type { DeviceOffboardAction } from '../../../types/offboarding';

/** Devices with at least this much lease left are worth keeping on site for the next hire. */
const REASSIGN_MIN_LEASE_DAYS = 180;

export function defaultDeviceAction(device: Device): DeviceOffboardAction {
  // Desk phones stay at the desk; they're re-provisioned for whoever sits there next.
  if (device.type === 'voip-phone') return 'wipe-reassign';
  return daysUntilTermEnd(device, getNow()) >= REASSIGN_MIN_LEASE_DAYS ? 'wipe-reassign' : 'wipe-return';
}
