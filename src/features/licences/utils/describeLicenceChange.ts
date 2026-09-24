import type { LicenceChangeResult } from '../types/licenceChange';
import { getSoftwareProduct } from './softwareLookup';

/** One-line confirmation, e.g. "Priya Raman: 2 licences added, 1 removed. 1 CAD Suite seat bought." */
export function describeLicenceChange(person: string, result: LicenceChangeResult): string {
  const parts: string[] = [];
  if (result.added) parts.push(`${result.added} ${result.added === 1 ? 'licence' : 'licences'} added`);
  if (result.removed) parts.push(`${result.removed} removed`);
  const summary = `${person}: ${parts.join(', ') || 'no changes'}.`;

  const bought = result.seatsAdded
    .map(({ softwareId, count }) => `${count} ${getSoftwareProduct(softwareId)?.name ?? softwareId} ${count === 1 ? 'seat' : 'seats'}`)
    .join(', ');
  return bought ? `${summary} Bought ${bought}.` : summary;
}
