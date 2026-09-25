import { Fragment, useCallback, useMemo, useState, type ReactNode } from 'react';
import { setClockOffsetDays } from '../../../lib/date';
import { TimeTravelToast } from '../components/TimeTravelToast';
import type { TimeTravelSummary } from '../types/timeTravelSummary';
import { ClockContext, type ClockContextValue } from './ClockContext';

interface ClockProviderProps {
  children: ReactNode;
}

/**
 * Owns the demo clock. Dates across the app come from getNow(), which isn't reactive, so the tree
 * below is remounted whenever the clock moves; the data stores sit above this and keep their state.
 */
export function ClockProvider({ children }: ClockProviderProps) {
  const [offsetDays, setOffsetState] = useState(0);
  const [summary, setSummary] = useState<TimeTravelSummary | null>(null);

  const setOffsetDays = useCallback((days: number) => {
    // Update the module clock before React re-renders anything that reads it.
    setClockOffsetDays(days);
    setOffsetState(days);
  }, []);

  const dismissSummary = useCallback(() => setSummary(null), []);

  const value = useMemo<ClockContextValue>(
    () => ({ offsetDays, setOffsetDays, summary, setSummary }),
    [offsetDays, setOffsetDays, summary],
  );

  return (
    <ClockContext value={value}>
      <Fragment key={offsetDays}>{children}</Fragment>
      {summary && <TimeTravelToast summary={summary} onDismiss={dismissSummary} />}
    </ClockContext>
  );
}
