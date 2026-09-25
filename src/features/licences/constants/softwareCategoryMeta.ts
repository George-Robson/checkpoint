import {
  Building2,
  Code,
  Handshake,
  LayoutGrid,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { SoftwareCategory } from '../../../types/software';

interface SoftwareCategoryMeta {
  label: string;
  icon: LucideIcon;
}

export const SOFTWARE_CATEGORY_ORDER: SoftwareCategory[] = [
  'productivity',
  'ai',
  'design',
  'development',
  'collaboration',
  'communications',
  'sales',
  'security',
  'line-of-business',
];

export const SOFTWARE_CATEGORY_META: Record<SoftwareCategory, SoftwareCategoryMeta> = {
  productivity: { label: 'Productivity', icon: LayoutGrid },
  ai: { label: 'AI assistants', icon: Sparkles },
  design: { label: 'Design & creative', icon: Palette },
  development: { label: 'Development', icon: Code },
  collaboration: { label: 'Collaboration', icon: Users },
  communications: { label: 'Communications', icon: Phone },
  sales: { label: 'Sales & service', icon: Handshake },
  security: { label: 'Security & identity', icon: ShieldCheck },
  'line-of-business': { label: 'Line of business', icon: Building2 },
};
