import { createContext } from 'react';
import type { Kit } from '../../../types/kit';
import type { KitDraft } from '../types/kitDraft';

export interface SaveKitOptions {
  /** Omit to create a new kit. */
  kitId?: string;
  editorName: string;
}

export interface KitsContextValue {
  /** Templates and every client's kits. */
  kits: Kit[];
  saveKit: (draft: KitDraft, options: SaveKitOptions) => Kit;
}

export const KitsContext = createContext<KitsContextValue | null>(null);
