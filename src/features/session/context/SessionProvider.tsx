import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { users } from '../../../data/mockData';
import { SessionContext, type SessionContextValue } from './SessionContext';

const STORAGE_KEY = 'checkpoint.sessionUserId';

function readStoredUserId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && users.some((user) => user.id === stored)) return stored;
  } catch {
    // Storage unavailable: fall back to the MSP admin.
  }
  return users[0].id;
}

interface SessionProviderProps {
  children: ReactNode;
}

/** Mock sign-in: which demo account the app is being viewed as. */
export function SessionProvider({ children }: SessionProviderProps) {
  const [userId, setUserId] = useState(readStoredUserId);

  const switchUser = useCallback((nextUserId: string) => {
    setUserId(nextUserId);
    try {
      localStorage.setItem(STORAGE_KEY, nextUserId);
    } catch {
      // Non-critical: the choice just won't survive a reload.
    }
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      currentUser: users.find((user) => user.id === userId) ?? users[0],
      users,
      switchUser,
    }),
    [userId, switchUser],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
