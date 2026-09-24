import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import type { NavItem } from './navItems';

interface SidebarNavItemProps {
  item: NavItem;
  onNavigate?: () => void;
}

export function SidebarNavItem({ item, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-400"
      >
        <Icon aria-hidden="true" className="size-4" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Soon</span>
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-slate-100 font-medium text-slate-900'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            aria-hidden="true"
            className={cn('size-4', isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500')}
          />
          {item.label}
        </>
      )}
    </NavLink>
  );
}
