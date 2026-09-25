/** A named set of licences a client assigns together (e.g. "Developer tools"). Seats stay individual. */
export interface LicenceBundle {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  softwareIds: string[];
  updatedAt: string;
  updatedBy: string;
}
