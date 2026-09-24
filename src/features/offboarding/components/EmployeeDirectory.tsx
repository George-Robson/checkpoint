import { useState } from 'react';
import { SearchX, Users } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/SearchInput';
import type { OffboardingRequest } from '../../../types/offboarding';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import type { Employee } from '../types/employee';
import { EmployeeRow } from './EmployeeRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';

interface EmployeeDirectoryProps {
  employees: Employee[];
  /** Scheduled or in-progress requests, keyed by employee key. */
  openRequestByEmployee: Map<string, OffboardingRequest>;
  showTenant: boolean;
  onOffboard: (employee: Employee) => void;
}

export function EmployeeDirectory({ employees, openRequestByEmployee, showTenant, onOffboard }: EmployeeDirectoryProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleEmployees = employees.filter(
    (employee) =>
      !normalizedQuery ||
      [employee.name, employee.primarySite, getTenantName(employee.tenantId), ...employee.devices.map((d) => d.name)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Employees"
        description={`${employees.length} people with assigned devices`}
        actions={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search people or devices…"
            aria-label="Search employees"
            className="w-56 sm:w-64"
          />
        }
      />
      {employees.length === 0 ? (
        <EmptyState icon={Users} title="No employees" description="Nobody in this scope has an assigned device." />
      ) : visibleEmployees.length === 0 ? (
        <EmptyState icon={SearchX} title="No matches" description={`Nobody matches "${query}".`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className={HEADER_CELL}>
                  Employee
                </th>
                {showTenant && (
                  <th scope="col" className={HEADER_CELL}>
                    Client
                  </th>
                )}
                <th scope="col" className={HEADER_CELL}>
                  Assigned devices
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Offboarding
                </th>
                <th scope="col" className={HEADER_CELL}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEmployees.map((employee) => (
                <EmployeeRow
                  key={employee.key}
                  employee={employee}
                  openRequest={openRequestByEmployee.get(employee.key)}
                  showTenant={showTenant}
                  onOffboard={onOffboard}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
