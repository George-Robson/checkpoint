import { useContext } from 'react';
import { TicketsContext, type TicketsContextValue } from '../context/TicketsContext';

export function useTickets(): TicketsContextValue {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
}
