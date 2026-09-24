import type { LicenceAssignment } from '../../../types/licence';

export interface LicensedPerson {
  /** `${tenantId}:${name}` */
  key: string;
  name: string;
  tenantId: string;
  assignments: LicenceAssignment[];
  deviceCount: number;
  /** Set for new hires whose licences are all still scheduled. */
  startsOn: string | null;
}
