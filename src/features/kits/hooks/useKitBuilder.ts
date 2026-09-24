import { useState } from 'react';
import type { CatalogItemKind } from '../../../types/catalog';
import type { Kit } from '../../../types/kit';
import { useSession } from '../../session/hooks/useSession';
import type { KitBuilderErrors } from '../types/kitBuilder';
import type { KitDraft } from '../types/kitDraft';
import { getCatalogItem } from '../utils/catalogLookup';
import { useKits } from './useKits';

const MAX_LEAD_TIME_DAYS = 30;

function validate(draft: KitDraft): KitBuilderErrors {
  const errors: KitBuilderErrors = {};
  if (draft.name.trim().length < 2) errors.name = 'Give the kit a name.';
  if (!draft.lines.some((line) => getCatalogItem(line.catalogItemId)?.kind === 'hardware')) {
    errors.hardware = 'Add at least one managed device.';
  }
  if (!Number.isInteger(draft.leadTimeDays) || draft.leadTimeDays < 1 || draft.leadTimeDays > MAX_LEAD_TIME_DAYS) {
    errors.leadTimeDays = `Enter a lead time between 1 and ${MAX_LEAD_TIME_DAYS} days.`;
  }
  return errors;
}

/** Editable kit state for the builder; saving writes to the shared kit store. */
export function useKitBuilder(initialDraft: KitDraft, kitId: string | undefined) {
  const { saveKit } = useKits();
  const { currentUser } = useSession();
  const [draft, setDraft] = useState<KitDraft>(initialDraft);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = validate(draft);

  function setField<K extends keyof KitDraft>(field: K, value: KitDraft[K]) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  function addLine(catalogItemId: string) {
    setDraft((previous) =>
      previous.lines.some((line) => line.catalogItemId === catalogItemId)
        ? previous
        : { ...previous, lines: [...previous.lines, { catalogItemId, quantity: 1 }] },
    );
  }

  function setQuantity(catalogItemId: string, quantity: number) {
    setDraft((previous) => ({
      ...previous,
      lines: previous.lines.map((line) => (line.catalogItemId === catalogItemId ? { ...line, quantity } : line)),
    }));
  }

  function removeLine(catalogItemId: string) {
    setDraft((previous) => ({
      ...previous,
      lines: previous.lines.filter((line) => line.catalogItemId !== catalogItemId),
    }));
  }

  function toggleRecommendedSoftware(softwareId: string, included: boolean) {
    setDraft((previous) => ({
      ...previous,
      recommendedSoftwareIds: included
        ? [...previous.recommendedSoftwareIds, softwareId]
        : previous.recommendedSoftwareIds.filter((id) => id !== softwareId),
    }));
  }

  function linesOfKind(kind: CatalogItemKind) {
    return draft.lines.filter((line) => getCatalogItem(line.catalogItemId)?.kind === kind);
  }

  /** Saves when valid; otherwise reveals errors and returns null. */
  function save(): Kit | null {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0) return null;
    return saveKit(
      { ...draft, name: draft.name.trim(), tagline: draft.tagline.trim(), audience: draft.audience.trim() },
      { kitId, editorName: currentUser.name },
    );
  }

  return {
    draft,
    setField,
    addLine,
    setQuantity,
    removeLine,
    toggleRecommendedSoftware,
    linesOfKind,
    errors: hasSubmitted ? errors : {},
    save,
  };
}
