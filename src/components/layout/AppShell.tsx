import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  // The main pane scrolls independently of the window, so reset it on navigation.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMobileNav();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen, closeMobileNav]);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <aside className="hidden lg:flex">
        <Sidebar />
      </aside>

      {mobileNavOpen && (
        <div role="dialog" aria-modal="true" aria-label="Navigation" className="fixed inset-0 z-40 lg:hidden">
          <div aria-hidden="true" onClick={closeMobileNav} className="absolute inset-0 bg-slate-900/20" />
          <div className="relative h-full w-60">
            <Sidebar onNavigate={closeMobileNav} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={() => setMobileNavOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
