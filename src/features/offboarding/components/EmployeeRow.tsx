import { UserMinus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';
import { initialsFor } from '../../../lib/initials';
import type { OffboardingRequest } from '../../../types/offboarding';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import type { Employee } from '../types/employee';
import { EmployeeDeviceIcons } from './EmployeeDeviceIcons';
import { OffboardingStatusBadge } from './OffboardingStatusBadge';

const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface EmployeeRowProps {
  employee: Employee;
  openRequest: OffboardingRequest | undefined;
  showTenant: boolean;
  onOffboard: (employee: Employee) => void;
}

export function EmployeeRow({ employee, openRequest, showTenant, onOffboard }: EmployeeRowProps) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className={CELL}>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600"
          >
            {initialsFor(employee.name)}
          </span>
          <div className="min-w-0">
            <p className="whitespace-nowrap font-medium text-slate-900">{employee.name}</p>
            <p className="whitespace-nowrap text-xs text-slate-500">{employee.primarySite}</p>
          </div>
        </div>
      </td>
      {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(employee.tenantId)}</td>}
      <td className={CELL}>
        <div className="flex items-center gap-2">
          <EmployeeDeviceIcons devices={employee.devices} />
          <span className="text-xs tabular-nums text-slate-500">{employee.devices.length}</span>
        </div>
      </td>
      <td className={CELL}>
        {openRequest ? (
          <div>
            <OffboardingStatusBadge status={openRequest.status} />
            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{openRequest.reference}</p>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className={cn(CELL, 'text-right')}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOffboard(employee)}
          disabled={Boolean(openRequest)}
          aria-label={`Offboard ${employee.name}`}
        >
          <UserMinus aria-hidden="true" className="size-3.5" />
          Offboard
        </Button>
      </td>
    </tr>
  );
}
