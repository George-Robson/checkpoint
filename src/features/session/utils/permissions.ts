import type { Kit } from '../../../types/kit';
import type { SessionUser } from '../../../types/sessionUser';

export const ROLE_LABELS: Record<SessionUser['role'], string> = {
  'msp-admin': 'MSP admin',
  'client-admin': 'Client admin',
};

/** MSP staff edit everything; client admins edit only their own organisation's kits (never templates). */
export function canEditKit(user: SessionUser, kit: Pick<Kit, 'ownerTenantId'>): boolean {
  return user.role === 'msp-admin' || (kit.ownerTenantId !== null && kit.ownerTenantId === user.tenantId);
}

export function canManageTemplates(user: SessionUser): boolean {
  return user.role === 'msp-admin';
}

/** Whether the user may view a kit at all (templates are visible to everyone). */
export function canViewKit(user: SessionUser, kit: Pick<Kit, 'ownerTenantId'>): boolean {
  return user.role === 'msp-admin' || kit.ownerTenantId === null || kit.ownerTenantId === user.tenantId;
}
