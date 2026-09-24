import { useContext } from 'react';
import { OffboardingContext, type OffboardingContextValue } from '../context/OffboardingContext';

export function useOffboarding(): OffboardingContextValue {
  const context = useContext(OffboardingContext);
  if (!context) {
    throw new Error('useOffboarding must be used within an OffboardingProvider');
  }
  return context;
}
