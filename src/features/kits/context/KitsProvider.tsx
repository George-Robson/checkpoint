import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { kits as seedKits } from '../../../data/mockData';
import { getNow } from '../../../lib/date';
import type { Kit } from '../../../types/kit';
import type { KitDraft } from '../types/kitDraft';
import { KitsContext, type KitsContextValue, type SaveKitOptions } from './KitsContext';

interface KitsProviderProps {
  children: ReactNode;
}

/** In-memory kit library: seeded from mock data, edits last until reload. */
export function KitsProvider({ children }: KitsProviderProps) {
  const [kits, setKits] = useState<Kit[]>(seedKits);
  const nextIdRef = useRef(1);

  const saveKit = useCallback((draft: KitDraft, { kitId, editorName }: SaveKitOptions): Kit => {
    const saved: Kit = {
      ...draft,
      id: kitId ?? `kit-custom-${nextIdRef.current++}`,
      updatedAt: getNow().toISOString(),
      updatedBy: editorName,
    };

    setKits((previous) =>
      kitId ? previous.map((kit) => (kit.id === kitId ? saved : kit)) : [...previous, saved],
    );
    return saved;
  }, []);

  const value = useMemo<KitsContextValue>(() => ({ kits, saveKit }), [kits, saveKit]);

  return <KitsContext value={value}>{children}</KitsContext>;
}
