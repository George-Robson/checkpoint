/** Licences to grant and/or remove for one person, applied atomically. */
export interface LicenceChange {
  tenantId: string;
  person: string;
  add: string[];
  remove: string[];
  /** Start date for new hires (assignments are scheduled until then); null = active now. */
  startsOn: string | null;
  changedBy: string;
}

export interface LicenceChangeResult {
  added: number;
  removed: number;
  /** Pools that had no free seat, and how many seats were bought to cover the change. */
  seatsAdded: { softwareId: string; count: number }[];
}
