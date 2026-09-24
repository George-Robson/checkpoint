import {
  Briefcase,
  ChartCandlestick,
  Code,
  Headset,
  Network,
  Package,
  ScanBarcode,
  Stethoscope,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import type { KitIconKey } from '../../../types/kit';

export const KIT_ICON_ORDER: KitIconKey[] = [
  'package',
  'code',
  'headset',
  'briefcase',
  'chart',
  'network',
  'scan',
  'stethoscope',
  'truck',
];

export const KIT_ICONS: Record<KitIconKey, { label: string; icon: LucideIcon }> = {
  package: { label: 'General', icon: Package },
  code: { label: 'Engineering', icon: Code },
  headset: { label: 'Sales & support', icon: Headset },
  briefcase: { label: 'Leadership', icon: Briefcase },
  chart: { label: 'Finance', icon: ChartCandlestick },
  network: { label: 'Network', icon: Network },
  scan: { label: 'Warehouse', icon: ScanBarcode },
  stethoscope: { label: 'Clinical', icon: Stethoscope },
  truck: { label: 'Logistics', icon: Truck },
};
