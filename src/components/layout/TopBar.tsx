import { Menu } from 'lucide-react';
import { TenantSwitcher } from '../../features/tenants/components/TenantSwitcher';
import { AlertsButton } from './AlertsButton';
import { GlobalSearchButton } from './GlobalSearchButton';

interface TopBarProps {
  onOpenNav: () => void;
}

export function TopBar({ onOpenNav }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="-ml-1 flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <TenantSwitcher />

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearchButton />
        <AlertsButton />
      </div>
    </header>
  );
}
