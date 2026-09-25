import { useContext } from 'react';
import { ClockContext, type ClockContextValue } from '../context/ClockContext';

export function useClock(): ClockContextValue {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error('useClock must be used within a ClockProvider');
  }
  return context;
}
