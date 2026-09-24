import { useContext } from 'react';
import { KitsContext, type KitsContextValue } from '../context/KitsContext';

export function useKits(): KitsContextValue {
  const context = useContext(KitsContext);
  if (!context) {
    throw new Error('useKits must be used within a KitsProvider');
  }
  return context;
}
