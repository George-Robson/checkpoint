export type UserRole = 'msp-admin' | 'client-admin';

/** A demo account the mockup can be viewed as. */
export interface SessionUser {
  id: string;
  name: string;
  initials: string;
  title: string;
  role: UserRole;
  /** Client admins are locked to one tenant; MSP staff see all (null). */
  tenantId: string | null;
}
