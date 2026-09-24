import { Bell } from 'lucide-react';
import { alerts } from '../../data/mockData';
import { useTenantScoped } from '../../features/tenants/hooks/useTenantScoped';

export function AlertsButton() {
  const scopedAlerts = useTenantScoped(alerts);
  const criticalCount = scopedAlerts.filter((alert) => alert.severity === 'critical').length;
  const label =
    criticalCount > 0 ? `Alerts: ${criticalCount} critical` : `Alerts: ${scopedAlerts.length} open`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="relative flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    >
      <Bell aria-hidden="true" className="size-4" />
      {criticalCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white"
        />
      )}
    </button>
  );
}
