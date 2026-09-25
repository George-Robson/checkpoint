export type KitAssignmentTarget = 'user' | 'site';

export type KitIconKey =
  | 'package'
  | 'code'
  | 'headset'
  | 'network'
  | 'briefcase'
  | 'chart'
  | 'scan'
  | 'stethoscope'
  | 'truck'
  | 'palette'
  | 'gamepad';

/** A catalogue item and how many of it the kit includes. */
export interface KitLine {
  catalogItemId: string;
  quantity: number;
}

export interface Kit {
  id: string;
  /** null = Checkpoint template library; otherwise the client that owns this kit. */
  ownerTenantId: string | null;
  /** The template this kit was copied from. Copies are independent: edits never sync. */
  sourceTemplateId: string | null;
  name: string;
  tagline: string;
  description: string;
  audience: string;
  icon: KitIconKey;
  assignmentTarget: KitAssignmentTarget;
  leadTimeDays: number;
  lines: KitLine[];
  /** Software pre-selected when onboarding someone with this kit. Licensed separately, never billed with the kit. */
  recommendedSoftwareIds: string[];
  updatedAt: string;
  updatedBy: string;
}
