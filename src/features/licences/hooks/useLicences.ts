import { useContext } from 'react';
import { LicencesContext, type LicencesContextValue } from '../context/LicencesContext';

export function useLicences(): LicencesContextValue {
  const context = useContext(LicencesContext);
  if (!context) {
    throw new Error('useLicences must be used within a LicencesProvider');
  }
  return context;
}
