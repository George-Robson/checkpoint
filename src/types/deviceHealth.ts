/** Network gear and desk phones report firmware updates the same way (see DeviceHealth.patch.kind). */
export type PatchStatus = 'current' | 'pending' | 'overdue' | 'failed' | 'not-applicable';

export type ProtectionStatus = 'active' | 'outdated' | 'missing' | 'not-applicable';

export type EncryptionStatus = 'encrypted' | 'not-encrypted' | 'not-applicable';

/**
 * A device's health as reported by the monitoring tool (RMM) and Intune. In production this is synced
 * from those tools; here it's derived deterministically from the fleet.
 */
export interface DeviceHealth {
  deviceId: string;
  osVersion: string;
  patch: {
    status: PatchStatus;
    /** Updates available but not installed. */
    missing: number;
    lastPatchedOn: string | null;
    /** OS patches, or firmware for network gear and phones. */
    kind: 'os' | 'firmware';
  };
  /** Endpoint detection and response (antivirus) agent. */
  edr: ProtectionStatus;
  edrProduct: string | null;
  encryption: EncryptionStatus;
  diskFreePercent: number | null;
}

export type HealthLevel = 'healthy' | 'warning' | 'critical' | 'unmonitored';
