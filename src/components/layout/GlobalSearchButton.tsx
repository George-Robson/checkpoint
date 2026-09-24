import { Search } from 'lucide-react';

export function GlobalSearchButton() {
  return (
    <button
      type="button"
      className="hidden h-9 w-64 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-400 hover:bg-slate-50 md:flex"
    >
      <Search aria-hidden="true" className="size-4" />
      <span className="flex-1 text-left">Search devices, users…</span>
      <kbd className="rounded-md border border-slate-200 px-1.5 font-sans text-xs text-slate-500">Ctrl K</kbd>
    </button>
  );
}
