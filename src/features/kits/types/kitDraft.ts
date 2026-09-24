import type { Kit } from '../../../types/kit';

/** A kit being created or edited: everything except the fields the store assigns on save. */
export type KitDraft = Omit<Kit, 'id' | 'updatedAt' | 'updatedBy'>;
