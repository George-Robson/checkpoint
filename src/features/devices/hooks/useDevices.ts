import { useContext } from 'react';
import { DevicesContext, type DevicesContextValue } from '../context/DevicesContext';

export function useDevices(): DevicesContextValue {
  const context = useContext(DevicesContext);
  if (!context) {
    throw new Error('useDevices must be used within a DevicesProvider');
  }
  return context;
}
