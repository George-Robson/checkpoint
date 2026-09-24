import { addDays, toIsoDate } from '../../../lib/date';
import type { LicenceAssignment, LicencePool } from '../../../types/licence';
import type { LicenceChange, LicenceChangeResult } from '../types/licenceChange';

export interface LicenceState {
  pools: LicencePool[];
  assignments: LicenceAssignment[];
}

const DAYS_IN_YEAR = 365;

/**
 * Pure state transition: removes, then adds licences for one person. Any pool without a free seat
 * grows to fit (and a missing pool is created), so the result reports what had to be bought.
 */
export function applyLicenceChange(
  state: LicenceState,
  change: LicenceChange,
  now: Date,
  nextId: () => string,
): { state: LicenceState; result: LicenceChangeResult } {
  const { tenantId, person } = change;
  const removeSet = new Set(change.remove);

  let assignments = state.assignments.filter(
    (assignment) =>
      !(assignment.tenantId === tenantId && assignment.person === person && removeSet.has(assignment.softwareId)),
  );
  const removed = state.assignments.length - assignments.length;

  const alreadyHeld = new Set(
    assignments.filter((a) => a.tenantId === tenantId && a.person === person).map((a) => a.softwareId),
  );
  const toAdd = change.add.filter((softwareId) => !alreadyHeld.has(softwareId));

  assignments = [
    ...assignments,
    ...toAdd.map((softwareId) => ({
      id: nextId(),
      tenantId,
      softwareId,
      person,
      status: change.startsOn ? ('scheduled' as const) : ('active' as const),
      startsOn: change.startsOn,
      assignedAt: now.toISOString(),
      assignedBy: change.changedBy,
    })),
  ];

  const tenantRenewal =
    state.pools.find((pool) => pool.tenantId === tenantId)?.renewalDate ?? toIsoDate(addDays(now, DAYS_IN_YEAR));
  const pools = [...state.pools];
  const seatsAdded: LicenceChangeResult['seatsAdded'] = [];

  for (const softwareId of toAdd) {
    const used = assignments.filter((a) => a.tenantId === tenantId && a.softwareId === softwareId).length;
    const index = pools.findIndex((pool) => pool.tenantId === tenantId && pool.softwareId === softwareId);
    const seats = index === -1 ? 0 : pools[index].seats;
    if (used <= seats) continue;

    seatsAdded.push({ softwareId, count: used - seats });
    if (index === -1) {
      pools.push({ id: `lp-${tenantId}-${softwareId}`, tenantId, softwareId, seats: used, renewalDate: tenantRenewal });
    } else {
      pools[index] = { ...pools[index], seats: used };
    }
  }

  return { state: { pools, assignments }, result: { added: toAdd.length, removed, seatsAdded } };
}
