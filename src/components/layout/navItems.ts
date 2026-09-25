import {
  Boxes,
  FileChartColumn,
  HeartPulse,
  LifeBuoy,
  KeyRound,
  LayoutDashboard,
  MonitorSmartphone,
  PackagePlus,
  ReceiptText,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '../../app/paths';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match the path exactly (needed for the index route). */
  end?: boolean;
  /** Shown in the nav as an upcoming module, not clickable. */
  disabled?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Fleet', to: paths.fleet, icon: MonitorSmartphone },
      { label: 'Onboarding', to: paths.onboarding, icon: UserPlus },
      { label: 'Storefront', to: paths.storefront, icon: PackagePlus },
      { label: 'Offboarding', to: paths.offboarding, icon: UserMinus },
      { label: 'Software & licences', to: paths.software, icon: KeyRound },
    ],
  },
  {
    label: 'Service',
    items: [
      { label: 'Support', to: paths.support, icon: LifeBuoy },
      { label: 'Health & security', to: paths.health, icon: HeartPulse },
      { label: 'Reports', to: paths.reports, icon: FileChartColumn },
    ],
  },
  {
    label: 'Billing',
    items: [{ label: 'Invoices', to: paths.invoices, icon: ReceiptText }],
  },
  {
    label: 'Configuration',
    items: [{ label: 'Kits & catalogue', to: paths.kits, icon: Boxes }],
  },
];
