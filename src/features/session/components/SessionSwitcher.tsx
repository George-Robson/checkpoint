import { useCallback, useRef, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { cn } from '../../../lib/cn';
import { useSession } from '../hooks/useSession';
import { ROLE_LABELS } from '../utils/permissions';

/** Sidebar footer: shows the signed-in demo account and switches between them. */
export function SessionSwitcher() {
  const { currentUser, users, switchUser } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  return (
    <div
      ref={containerRef}
      className="relative border-t border-slate-200 p-2"
      onKeyDown={(event) => event.key === 'Escape' && close()}
    >
      {open && (
        <div
          role="menu"
          aria-label="Switch account"
          className="absolute inset-x-2 bottom-full mb-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        >
          <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-slate-500">View the mockup as</p>
          {users.map((user) => {
            const selected = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  switchUser(user.id);
                  close();
                }}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700"
                >
                  {user.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">{user.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {ROLE_LABELS[user.role]} · {user.title}
                  </span>
                </span>
                {selected && <Check aria-hidden="true" className="size-4 shrink-0 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-slate-50',
          open && 'bg-slate-50',
        )}
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700"
        >
          {currentUser.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{currentUser.name}</span>
          <span className="block truncate text-xs text-slate-500">{currentUser.title}</span>
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
      </button>
    </div>
  );
}
