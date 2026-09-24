import { SessionSwitcher } from '../../features/session/components/SessionSwitcher';
import { BrandMark } from './BrandMark';
import { SidebarNavItem } from './SidebarNavItem';
import { navSections } from './navItems';

interface SidebarProps {
  /** Called after a nav link is clicked (closes the mobile drawer). */
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-4">
        <BrandMark />
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-1 text-xs font-medium text-slate-500">{section.label}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <SidebarNavItem item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <SessionSwitcher />
    </div>
  );
}
