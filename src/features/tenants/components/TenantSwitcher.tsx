import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronsUpDown, Lock, Search } from 'lucide-react';
import { devices } from '../../../data/mockData';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { GLOBAL_VIEW_ID } from '../constants/globalView';
import { useTenant } from '../hooks/useTenant';
import { TenantAvatar } from './TenantAvatar';
import { TenantSwitcherOption } from './TenantSwitcherOption';

const GLOBAL_VIEW_LABEL = 'Global View (All)';

const deviceCountByTenant = devices.reduce<Record<string, number>>((counts, device) => {
  counts[device.tenantId] = (counts[device.tenantId] ?? 0) + 1;
  return counts;
}, {});

export function TenantSwitcher() {
  const { tenants, selectedTenant, selectedTenantId, selectTenant, isLocked } = useTenant();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useClickOutside(containerRef, close, open);

  const normalizedQuery = query.trim().toLowerCase();
  const matchingTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(normalizedQuery) ||
      tenant.shortCode.toLowerCase().includes(normalizedQuery),
  );
  const showGlobalView = GLOBAL_VIEW_LABEL.toLowerCase().includes(normalizedQuery);
  const hasResults = showGlobalView || matchingTenants.length > 0;

  function handleSelect(tenantId: string) {
    selectTenant(tenantId);
    close();
    triggerRef.current?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const options = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
    );

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      options[0]?.click();
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (options.length === 0) return;

    const step = event.key === 'ArrowDown' ? 1 : -1;
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const startIndex = step === 1 ? 0 : options.length - 1;
    const nextIndex =
      currentIndex === -1 ? startIndex : (currentIndex + step + options.length) % options.length;
    options[nextIndex].focus();
  }

  if (isLocked && selectedTenant) {
    return (
      <div
        title="Your account is limited to this organisation"
        className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 pl-1.5 pr-2.5 text-sm"
      >
        <TenantAvatar tenant={selectedTenant} size="sm" />
        <span className="max-w-40 truncate font-medium text-slate-900">{selectedTenant.name}</span>
        <Lock aria-label="Locked to your organisation" className="size-3.5 text-slate-400" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white pl-1.5 pr-2 text-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <TenantAvatar tenant={selectedTenant} size="sm" />
        <span className="max-w-40 truncate font-medium text-slate-900">
          {selectedTenant?.name ?? 'Global View'}
        </span>
        <span className="hidden text-xs text-slate-500 sm:inline">
          {selectedTenant ? selectedTenant.plan : 'All clients'}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 text-slate-400" />
      </button>

      {open && (
        <div
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 top-full z-30 mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a client…"
                aria-label="Filter clients"
                className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div ref={listRef} role="listbox" aria-label="Clients" className="max-h-80 overflow-y-auto p-1">
            {showGlobalView && (
              <TenantSwitcherOption
                tenant={null}
                label={GLOBAL_VIEW_LABEL}
                meta={`${tenants.length} clients · ${devices.length} devices`}
                selected={selectedTenantId === GLOBAL_VIEW_ID}
                onSelect={() => handleSelect(GLOBAL_VIEW_ID)}
              />
            )}

            {matchingTenants.length > 0 && (
              <>
                {showGlobalView && <div role="separator" className="my-1 h-px bg-slate-100" />}
                <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-slate-500">Clients</p>
                {matchingTenants.map((tenant) => (
                  <TenantSwitcherOption
                    key={tenant.id}
                    tenant={tenant}
                    label={tenant.name}
                    meta={`${tenant.plan} · ${deviceCountByTenant[tenant.id] ?? 0} devices`}
                    selected={selectedTenantId === tenant.id}
                    onSelect={() => handleSelect(tenant.id)}
                  />
                ))}
              </>
            )}

            {!hasResults && (
              <p className="px-2 py-6 text-center text-sm text-slate-500">No clients match “{query}”</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
