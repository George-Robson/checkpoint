import { useCallback, useMemo, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import type { OffboardingRequest } from '../../types/offboarding';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { OffboardingDrawer } from './components/OffboardingDrawer';
import { OffboardingRequestsTable } from './components/OffboardingRequestsTable';
import { useEmployees } from './hooks/useEmployees';
import { useOffboarding } from './hooks/useOffboarding';
import type { Employee } from './types/employee';
import { employeeKey } from './utils/employeeKey';

export function OffboardingPage() {
  const { selectedTenant, isGlobalView } = useTenant();
  const employees = useEmployees();
  const { requests } = useOffboarding();
  const scopedRequests = useTenantScoped(requests);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

  const openRequestByEmployee = useMemo(
    () =>
      new Map(
        scopedRequests
          .filter((request) => request.status !== 'completed')
          .map((request) => [employeeKey(request.tenantId, request.employee), request]),
      ),
    [scopedRequests],
  );

  const closeDrawer = useCallback(() => setSelectedEmployee(null), []);
  const handleSubmitted = useCallback((request: OffboardingRequest) => setLastRequestId(request.id), []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Offboarding"
        description={`Revoke access, wipe devices and recover hardware when someone leaves${selectedTenant ? ` ${selectedTenant.name}` : ''}.`}
      />

      <OffboardingRequestsTable requests={scopedRequests} showTenant={isGlobalView} highlightRequestId={lastRequestId} />

      <EmployeeDirectory
        employees={employees}
        openRequestByEmployee={openRequestByEmployee}
        showTenant={isGlobalView}
        onOffboard={setSelectedEmployee}
      />

      {selectedEmployee && (
        <OffboardingDrawer
          key={selectedEmployee.key}
          employee={selectedEmployee}
          onClose={closeDrawer}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}
