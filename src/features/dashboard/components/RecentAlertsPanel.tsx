import { ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import type { Alert } from '../../../types/alert';
import { AlertRow } from './AlertRow';

interface RecentAlertsPanelProps {
  alerts: Alert[];
  criticalCount: number;
  showTenant: boolean;
  className?: string;
}

export function RecentAlertsPanel({ alerts, criticalCount, showTenant, className }: RecentAlertsPanelProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Recent alerts" description={`${alerts.length} open · ${criticalCount} critical`} />
      {alerts.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="All clear" description="No open alerts for this scope." />
      ) : (
        <ul className="max-h-96 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto lg:max-h-none">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} showTenant={showTenant} />
          ))}
        </ul>
      )}
    </Card>
  );
}
