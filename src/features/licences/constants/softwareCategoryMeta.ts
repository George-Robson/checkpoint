import { Building2, Code, Handshake, LayoutGrid, Phone, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { SoftwareCategory } from '../../../types/software';

interface SoftwareCategoryMeta {
  label: string;
  icon: LucideIcon;
}

export const SOFTWARE_CATEGORY_ORDER: SoftwareCategory[] = [
  'productivity',
  'security',
  'communications',
  'sales',
  'development',
  'line-of-business',
];

export const SOFTWARE_CATEGORY_META: Record<SoftwareCategory, SoftwareCategoryMeta> = {
  productivity: { label: 'Productivity', icon: LayoutGrid },
  security: { label: 'Security & device policy', icon: ShieldCheck },
  communications: { label: 'Communications', icon: Phone },
  sales: { label: 'Sales', icon: Handshake },
  development: { label: 'Development', icon: Code },
  'line-of-business': { label: 'Line of business', icon: Building2 },
};
