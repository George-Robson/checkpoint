import { useMemo, useState } from 'react';
import { HOME_DELIVERY } from '../../../constants/delivery';
import { addDays, formatDate, getNow, toIsoDate } from '../../../lib/date';
import type { Acquisition } from '../../../types/acquisition';
import type { Kit } from '../../../types/kit';
import type { Order } from '../../../types/order';
import { useOrders } from '../../orders/hooks/useOrders';
import { useSession } from '../../session/hooks/useSession';
import type { KitOrderFormErrors, KitOrderFormValues } from '../types/kitOrderForm';
import { getTenantSites } from '../../tenants/utils/getTenantSites';

function validate(values: KitOrderFormValues, kit: Kit, earliestStartDate: string): KitOrderFormErrors {
  const errors: KitOrderFormErrors = {};
  const isSiteKit = kit.assignmentTarget === 'site';

  if (values.assignee.trim().length < 2) {
    errors.assignee = isSiteKit ? 'Enter a name for the new site.' : "Enter the recipient's full name.";
  }
  if (!values.startDate || values.startDate < earliestStartDate) {
    errors.startDate = `Choose a date on or after ${formatDate(earliestStartDate)}.`;
  }
  if (!isSiteKit && !values.shipTo) errors.shipTo = 'Choose where to deliver the kit.';

  return errors;
}

/** Order form for a client kit; the order is placed for the tenant that owns the kit. */
export function useKitOrderForm(kit: Kit & { ownerTenantId: string }, acquisition: Acquisition) {
  const { placeOrder } = useOrders();
  const { currentUser } = useSession();
  const sites = useMemo(() => getTenantSites(kit.ownerTenantId), [kit.ownerTenantId]);

  // Delivery lands after the lead time; the earliest start is the following day so kit is there on day one.
  const earliestStartDate = useMemo(() => toIsoDate(addDays(getNow(), kit.leadTimeDays + 1)), [kit.leadTimeDays]);

  const [values, setValues] = useState<KitOrderFormValues>(() => ({
    assignee: '',
    startDate: earliestStartDate,
    shipTo: sites[0] ?? HOME_DELIVERY,
    notes: '',
  }));
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = validate(values, kit, earliestStartDate);

  function setField<K extends keyof KitOrderFormValues>(field: K, value: KitOrderFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  /** Places the order when valid; otherwise reveals errors and returns null. */
  function submit(): Order | null {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0) return null;

    const assignee = values.assignee.trim();
    return placeOrder({
      kit,
      tenantId: kit.ownerTenantId,
      acquisition,
      assignee,
      requestedBy: currentUser.name,
      startDate: values.startDate,
      shipTo: kit.assignmentTarget === 'site' ? assignee : values.shipTo,
      notes: values.notes.trim() || undefined,
    });
  }

  return {
    values,
    setField,
    // Errors appear after the first submit attempt, then update live as fields are fixed.
    errors: hasSubmitted ? errors : {},
    sites,
    earliestStartDate,
    submit,
  };
}
