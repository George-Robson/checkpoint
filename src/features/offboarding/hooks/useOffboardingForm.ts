import { useState } from 'react';
import { addDays, formatDate, getNow, toIsoDate } from '../../../lib/date';
import type { AccountAction, OffboardingRequest } from '../../../types/offboarding';
import { useSession } from '../../session/hooks/useSession';
import { getTenant } from '../../tenants/utils/tenantLookup';
import { ACCOUNT_ACTION_META, ACCOUNT_ACTION_ORDER } from '../constants/accountActionMeta';
import type { Employee } from '../types/employee';
import type { OffboardingFormErrors, OffboardingFormValues } from '../types/offboardingForm';
import { defaultDeviceAction } from '../utils/defaultDeviceAction';
import { startsImmediately } from '../utils/startsImmediately';
import { useOffboarding } from './useOffboarding';

/** Default last working day: one week out, the usual notice for a planned leaver. */
const DEFAULT_NOTICE_DAYS = 7;

/** The client's primary contact receives the data, unless they are the one leaving. */
function defaultLineManager(employee: Employee): string {
  const contact = getTenant(employee.tenantId)?.primaryContact;
  return contact && contact !== employee.name ? contact : '';
}

function validate(values: OffboardingFormValues, today: string, wipeCount: number): OffboardingFormErrors {
  const errors: OffboardingFormErrors = {};
  const needsManager = ACCOUNT_ACTION_ORDER.some(
    (action) => values.accountActions[action] && ACCOUNT_ACTION_META[action].needsLineManager,
  );

  if (!values.lastWorkingDay || values.lastWorkingDay < today) {
    errors.lastWorkingDay = `Choose today (${formatDate(today)}) or a later date.`;
  }
  if (needsManager && values.lineManager.trim().length < 2) {
    errors.lineManager = 'Enter who should receive their mailbox and files.';
  }
  if (wipeCount > 0 && !values.confirmed) {
    errors.confirmed = 'Confirm you understand wiped devices cannot be recovered.';
  }
  return errors;
}

export function useOffboardingForm(employee: Employee) {
  const { submitOffboarding } = useOffboarding();
  const { currentUser } = useSession();
  const today = toIsoDate(getNow());

  const [values, setValues] = useState<OffboardingFormValues>(() => ({
    lastWorkingDay: toIsoDate(addDays(getNow(), DEFAULT_NOTICE_DAYS)),
    accessRevocation: 'end-of-day',
    deviceActions: Object.fromEntries(employee.devices.map((device) => [device.id, defaultDeviceAction(device)])),
    returnMethod: 'courier',
    accountActions: Object.fromEntries(ACCOUNT_ACTION_ORDER.map((action) => [action, true])) as Record<
      AccountAction,
      boolean
    >,
    lineManager: defaultLineManager(employee),
    confirmed: false,
  }));
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const deviceActionList = Object.values(values.deviceActions);
  const wipeCount = deviceActionList.filter((action) => action !== 'retain').length;
  const returnCount = deviceActionList.filter((action) => action === 'wipe-return').length;
  const startsNow = startsImmediately(values.accessRevocation, values.lastWorkingDay);
  const errors = validate(values, today, wipeCount);

  function setField<K extends keyof OffboardingFormValues>(field: K, value: OffboardingFormValues[K]) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
      // An immediate exit means today is the last working day.
      ...(field === 'accessRevocation' && value === 'immediately' ? { lastWorkingDay: today } : {}),
    }));
  }

  function setDeviceAction(deviceId: string, action: OffboardingFormValues['deviceActions'][string]) {
    setValues((previous) => ({ ...previous, deviceActions: { ...previous.deviceActions, [deviceId]: action } }));
  }

  function setAccountAction(action: AccountAction, enabled: boolean) {
    setValues((previous) => ({ ...previous, accountActions: { ...previous.accountActions, [action]: enabled } }));
  }

  function submit(): OffboardingRequest | null {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0) return null;

    const lineManager = values.lineManager.trim();
    return submitOffboarding({
      tenantId: employee.tenantId,
      employee: employee.name,
      lastWorkingDay: values.lastWorkingDay,
      accessRevocation: values.accessRevocation,
      returnMethod: returnCount > 0 ? values.returnMethod : null,
      lineManager: lineManager || null,
      accountActions: ACCOUNT_ACTION_ORDER.filter((action) => values.accountActions[action]),
      deviceActions: employee.devices.map((device) => ({
        deviceId: device.id,
        deviceName: device.name,
        action: values.deviceActions[device.id],
      })),
      requestedBy: currentUser.name,
    });
  }

  return {
    values,
    setField,
    setDeviceAction,
    setAccountAction,
    errors: hasSubmitted ? errors : {},
    today,
    wipeCount,
    returnCount,
    startsNow,
    submit,
  };
}
