/** The seats a client has bought for one software product. */
export interface LicencePool {
  id: string;
  tenantId: string;
  softwareId: string;
  seats: number;
  renewalDate: string;
}

/** 'scheduled' seats are reserved for a new hire and activate on their start date. */
export type LicenceAssignmentStatus = 'active' | 'scheduled';

export interface LicenceAssignment {
  id: string;
  tenantId: string;
  softwareId: string;
  person: string;
  status: LicenceAssignmentStatus;
  /** Start date for scheduled assignments. */
  startsOn: string | null;
  assignedAt: string;
  assignedBy: string;
}
