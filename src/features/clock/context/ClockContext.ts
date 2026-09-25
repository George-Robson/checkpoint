import { createContext } from 'react';
import type { TimeTravelSummary } from '../types/timeTravelSummary';

export interface ClockContextValue {
  /** Days the demo clock is ahead of the mock dataset's start date. */
  offsetDays: number;
  setOffsetDays: (days: number) => void;
  summary: TimeTravelSummary | null;
  setSummary: (summary: TimeTravelSummary | null) => void;
}

export const ClockContext = createContext<ClockContextValue | null>(null);
