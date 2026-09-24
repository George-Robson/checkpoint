import { Cpu, Keyboard, type LucideIcon } from 'lucide-react';
import type { CatalogItemKind } from '../../../types/catalog';

interface CatalogKindMeta {
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

export const CATALOG_KIND_ORDER: CatalogItemKind[] = ['hardware', 'peripheral'];

export const CATALOG_KIND_META: Record<CatalogItemKind, CatalogKindMeta> = {
  hardware: {
    label: 'Managed hardware',
    shortLabel: 'Hardware',
    description: 'Leased devices, enrolled and secured before dispatch. They appear in Fleet once delivered.',
    icon: Cpu,
  },
  peripheral: {
    label: 'Peripherals',
    shortLabel: 'Peripherals',
    description: 'Monitors, docks and accessories shipped with the kit.',
    icon: Keyboard,
  },
};
