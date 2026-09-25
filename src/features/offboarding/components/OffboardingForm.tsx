import type { FormEvent } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { RadioGroup } from '../../../components/ui/RadioGroup';
import { formatCurrency } from '../../../lib/currency';
import type { OffboardingRequest } from '../../../types/offboarding';
import { useLicences } from '../../licences/hooks/useLicences';
import { softwareMonthlyCost } from '../../licences/utils/softwareLookup';
import { ACCOUNT_ACTION_META, ACCOUNT_ACTION_ORDER } from '../constants/accountActionMeta';
import { DEVICE_ACTION_META } from '../constants/deviceActionMeta';
import type { useOffboardingForm } from '../hooks/useOffboardingForm';
import type { Employee } from '../types/employee';
import { DeviceActionRow } from './DeviceActionRow';

interface OffboardingFormProps {
  employee: Employee;
  form: ReturnType<typeof useOffboardingForm>;
  formId: string;
  onSubmitted: (request: OffboardingRequest) => void;
}

export function OffboardingForm({ employee, form, formId, onSubmitted }: OffboardingFormProps) {
  const { values, setField, setDeviceAction, setAccountAction, errors, today, wipeCount, returnCount, submit } = form;
  const { assignments } = useLicences();
  const heldSoftwareIds = assignments
    .filter((assignment) => assignment.tenantId === employee.tenantId && assignment.person === employee.name)
    .map((assignment) => assignment.softwareId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const request = submit();
    if (request) {
      onSubmitted(request);
    } else {
      requestAnimationFrame(() => formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    }
  }

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-5">
        <h3 className="text-sm font-medium text-slate-900">Timing</h3>
        <FormField
          label="Last working day"
          error={errors.lastWorkingDay}
          hint="Devices are wiped after access is revoked on this day."
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              data-autofocus
              type="date"
              min={today}
              value={values.lastWorkingDay}
              onChange={(event) => setField('lastWorkingDay', event.target.value)}
            />
          )}
        </FormField>
        <RadioGroup
          name="access-revocation"
          legend="Revoke access"
          value={values.accessRevocation}
          onChange={(value) => setField('accessRevocation', value)}
          options={[
            { value: 'end-of-day', label: 'At the end of their last working day', description: 'Standard for resignations and planned leavers.' },
            {
              value: 'immediately',
              label: 'Immediately',
              description: 'For dismissals. Sign-in is blocked and device wipes start as soon as you confirm.',
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-900">Devices</h3>
        <p className="mt-1 text-sm text-slate-500">
          Defaults are based on remaining lease: devices with 6+ months left stay on site as spares.
        </p>
        <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {employee.devices.map((device) => (
            <DeviceActionRow
              key={device.id}
              device={device}
              action={values.deviceActions[device.id]}
              onChange={(action) => setDeviceAction(device.id, action)}
            />
          ))}
        </ul>
        <dl className="mt-3 space-y-1 text-xs text-slate-500">
          {(['wipe-return', 'wipe-reassign'] as const).map((action) => (
            <div key={action} className="flex gap-1">
              <dt className="font-medium text-slate-700">{DEVICE_ACTION_META[action].label}:</dt>
              <dd>{DEVICE_ACTION_META[action].description}</dd>
            </div>
          ))}
        </dl>
      </section>

      {returnCount > 0 && (
        <RadioGroup
          name="return-method"
          legend={`Returning ${returnCount} ${returnCount === 1 ? 'device' : 'devices'}`}
          value={values.returnMethod}
          onChange={(value) => setField('returnMethod', value)}
          options={[
            {
              value: 'courier',
              label: 'Courier collection',
              description: `We'll email ${employee.name} a collection slot for their last working day.`,
            },
            {
              value: 'drop-off',
              label: `Drop off at ${employee.primarySite}`,
              description: 'Left with reception; our engineer collects on the next site visit.',
            },
          ]}
        />
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-900">Account & data</h3>
          <p className="mt-1 text-sm text-slate-500">
            {heldSoftwareIds.length > 0
              ? `${employee.name} holds ${heldSoftwareIds.length} software licences (${formatCurrency(softwareMonthlyCost(heldSoftwareIds))}/mo).`
              : `${employee.name} holds no software licences.`}
          </p>
        </div>
        {ACCOUNT_ACTION_ORDER.map((action) => {
          const meta = ACCOUNT_ACTION_META[action];
          return (
            <Checkbox
              key={action}
              label={meta.label}
              description={meta.description}
              checked={values.accountActions[action]}
              disabled={meta.required}
              onChange={(checked) => setAccountAction(action, checked)}
            />
          );
        })}
        <FormField
          label="Line manager"
          error={errors.lineManager}
          hint="Receives access to the shared mailbox and transferred files."
          optional={!values.accountActions['convert-mailbox'] && !values.accountActions['transfer-files']}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              value={values.lineManager}
              onChange={(event) => setField('lineManager', event.target.value)}
              placeholder="e.g. Sarah Whitfield"
              autoComplete="off"
            />
          )}
        </FormField>
      </section>

      {wipeCount > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <Checkbox
            label={`I understand ${wipeCount} ${wipeCount === 1 ? 'device' : 'devices'} will be wiped and data on them cannot be recovered.`}
            checked={values.confirmed}
            invalid={Boolean(errors.confirmed)}
            onChange={(checked) => setField('confirmed', checked)}
          />
          {errors.confirmed && <p className="mt-2 pl-7 text-xs text-rose-600">{errors.confirmed}</p>}
        </div>
      )}
    </form>
  );
}
