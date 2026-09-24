import type { Kit } from '../../../types/kit';

/** A kit owned by a client (as opposed to a Checkpoint template); only these can be ordered. */
export type ClientKit = Kit & { ownerTenantId: string };

export function isClientKit(kit: Kit): kit is ClientKit {
  return kit.ownerTenantId !== null;
}
