import { createContext } from 'react';
import type { SessionUser } from '../../../types/sessionUser';

export interface SessionContextValue {
  currentUser: SessionUser;
  /** Demo accounts available in the user switcher. */
  users: SessionUser[];
  switchUser: (userId: string) => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
