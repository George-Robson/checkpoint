import {
  Briefcase,
  ChartCandlestick,
  Code,
  Gamepad2,
  Headset,
  Network,
  Package,
  Palette,
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
  'palette',
  'gamepad',
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
  palette: { label: 'Art & design', icon: Palette },
  gamepad: { label: 'Games & QA', icon: Gamepad2 },
};
