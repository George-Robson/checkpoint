import { useEffect } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { formatDate } from '../../../lib/date';
import type { TimeTravelSummary } from '../types/timeTravelSummary';

/** How long the summary stays up before dismissing itself. */
const AUTO_DISMISS_MS = 10_000;

interface TimeTravelToastProps {
  summary: TimeTravelSummary;
  onDismiss: () => void;
}

export function TimeTravelToast({ summary, onDismiss }: TimeTravelToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [summary, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-sm motion-safe:animate-modal-in"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
          <CalendarClock aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">It's now {formatDate(summary.today)}</p>
          {summary.events.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">Nothing was due in that time.</p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
              {summary.events.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
