import { tenants } from '../../../data/mockData';
import type { Kit } from '../../../types/kit';
import type { SessionUser } from '../../../types/sessionUser';
import type { KitDraft } from '../types/kitDraft';

const LIBRARY_OWNER = 'library';

export function toDraft(kit: Kit): KitDraft {
  return {
    ownerTenantId: kit.ownerTenantId,
    sourceTemplateId: kit.sourceTemplateId,
    name: kit.name,
    tagline: kit.tagline,
    description: kit.description,
    audience: kit.audience,
    icon: kit.icon,
    assignmentTarget: kit.assignmentTarget,
    leadTimeDays: kit.leadTimeDays,
    lines: kit.lines.map((line) => ({ ...line })),
    recommendedSoftwareIds: [...kit.recommendedSoftwareIds],
  };
}

export function blankDraft(ownerTenantId: string | null): KitDraft {
  return {
    ownerTenantId,
    sourceTemplateId: null,
    name: '',
    tagline: '',
    description: '',
    audience: '',
    icon: 'package',
    assignmentTarget: 'user',
    leadTimeDays: 3,
    lines: [],
    recommendedSoftwareIds: [],
  };
}

/**
 * Copies a kit for a new owner. Copying a template into a client keeps its name and records the
 * template as the source; duplicating anything else is marked "(copy)" and inherits its source.
 */
export function copyDraft(source: Kit, ownerTenantId: string | null): KitDraft {
  const fromTemplate = source.ownerTenantId === null;
  const intoClient = ownerTenantId !== null;
  return {
    ...toDraft(source),
    ownerTenantId,
    sourceTemplateId: intoClient ? (fromTemplate ? source.id : source.sourceTemplateId) : null,
    name: fromTemplate && intoClient ? source.name : `${source.name} (copy)`,
  };
}

/**
 * Who a new kit belongs to, from the `owner` query param. Client admins can only create for their
 * own tenant; only MSP staff can add to the template library.
 */
export function resolveDraftOwner(ownerParam: string | null, user: SessionUser): string | null {
  if (user.tenantId) return user.tenantId;
  if (ownerParam === LIBRARY_OWNER) return null;
  return tenants.some((tenant) => tenant.id === ownerParam) ? ownerParam : null;
}
