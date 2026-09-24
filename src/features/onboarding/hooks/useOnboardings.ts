import { useContext } from 'react';
import { OnboardingsContext, type OnboardingsContextValue } from '../context/OnboardingsContext';

export function useOnboardings(): OnboardingsContextValue {
  const context = useContext(OnboardingsContext);
  if (!context) {
    throw new Error('useOnboardings must be used within an OnboardingsProvider');
  }
  return context;
}
