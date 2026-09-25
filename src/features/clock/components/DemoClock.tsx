import { useCallback, useRef, useState } from 'react';
import { CalendarClock, ChevronDown, RotateCcw } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { cn } from '../../../lib/cn';
import { getNow } from '../../../lib/date';
import { useTimeTravel } from '../hooks/useTimeTravel';

const JUMPS = [
  { days: 1, label: 'Advance 1 day' },
  { days: 7, label: 'Advance 1 week' },
  { days: 30, label: 'Advance 30 days' },
];

const dayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Top-bar control for moving the mock clock forward, so scheduled work (deliveries, start dates…) plays out. */
export function DemoClock() {
  const { offsetDays, advance, reset } = useTimeTravel();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  return (
    <div ref={containerRef} className="relative" onKeyDown={(event) => event.key === 'Escape' && close()}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        title="Demo clock"
        className={cn(
          'flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
          offsetDays > 0
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        )}
      >
        <CalendarClock aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{dayFormatter.format(getNow())}</span>
        {offsetDays > 0 && <span className="text-xs tabular-nums">+{offsetDays}d</span>}
        <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Demo clock"
          className="absolute right-0 top-full z-30 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-sm font-medium text-slate-900">Demo clock</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Move time forward to see orders deliver, new hires start, and offboardings and licences play out.
            </p>
          </div>
          {JUMPS.map((jump) => (
            <button
              key={jump.days}
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                advance(jump.days);
              }}
              className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
            >
              {jump.label}
            </button>
          ))}
          <div role="separator" className="my-1 h-px bg-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={reset}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          >
            <RotateCcw aria-hidden="true" className="size-3.5 text-slate-400" />
            Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}
