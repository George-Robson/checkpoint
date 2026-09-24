export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  tenantId: string;
  deviceId: string | null;
  createdAt: string;
}
