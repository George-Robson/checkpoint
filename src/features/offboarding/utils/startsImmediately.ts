import { getNow, toIsoDate } from '../../../lib/date';
import type { AccessRevocation } from '../../../types/offboarding';

/** True when access is cut and wipes begin now, rather than on a future last working day. */
export function startsImmediately(accessRevocation: AccessRevocation, lastWorkingDay: string): boolean {
  return accessRevocation === 'immediately' || lastWorkingDay <= toIsoDate(getNow());
}
