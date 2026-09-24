import { useId, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import type { OffboardingRequest } from '../../../types/offboarding';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { useOffboardingForm } from '../hooks/useOffboardingForm';
import type { Employee } from '../types/employee';
import { OffboardingForm } from './OffboardingForm';
import { OffboardingSuccess } from './OffboardingSuccess';

interface OffboardingDrawerProps {
  employee: Employee;
  onClose: () => void;
  onSubmitted: (request: OffboardingRequest) => void;
}

export function OffboardingDrawer({ employee, onClose, onSubmitted }: OffboardingDrawerProps) {
  const formId = useId();
  const form = useOffboardingForm(employee);
  const [submittedRequest, setSubmittedRequest] = useState<OffboardingRequest | null>(null);

  function handleSubmitted(request: OffboardingRequest) {
    setSubmittedRequest(request);
    onSubmitted(request);
  }

  const summary =
    form.wipeCount === 0
      ? 'No devices will be wiped'
      : `${form.wipeCount} ${form.wipeCount === 1 ? 'device' : 'devices'} will be wiped${form.startsNow ? ' now' : ''}`;

  const footer = submittedRequest ? (
    <div className="flex justify-end">
      <Button onClick={onClose}>Done</Button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-slate-500">{summary}</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} variant={form.startsNow ? 'danger' : 'primary'}>
          {form.startsNow ? 'Offboard now' : 'Schedule offboarding'}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      title={submittedRequest ? `Offboarding ${submittedRequest.reference}` : `Offboard ${employee.name}`}
      description={
        submittedRequest
          ? undefined
          : `${getTenantName(employee.tenantId)} · ${employee.devices.length} assigned ${employee.devices.length === 1 ? 'device' : 'devices'}`
      }
      onClose={onClose}
      footer={footer}
    >
      {submittedRequest ? (
        <OffboardingSuccess request={submittedRequest} primarySite={employee.primarySite} />
      ) : (
        <OffboardingForm employee={employee} form={form} formId={formId} onSubmitted={handleSubmitted} />
      )}
    </Drawer>
  );
}
