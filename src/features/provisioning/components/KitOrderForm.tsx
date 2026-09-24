import type { FormEvent } from 'react';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { HOME_DELIVERY } from '../../../constants/delivery';
import { formatDate } from '../../../lib/date';
import type { Kit } from '../../../types/kit';
import type { Order } from '../../../types/order';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { KitItemList } from '../../kits/components/KitItemList';
import { useKitOrderForm } from '../hooks/useKitOrderForm';

interface KitOrderFormProps {
  kit: Kit & { ownerTenantId: string };
  /** Lets the drawer footer's submit button target this form. */
  formId: string;
  onPlaced: (order: Order) => void;
}

export function KitOrderForm({ kit, formId, onPlaced }: KitOrderFormProps) {
  const { values, setField, errors, sites, earliestStartDate, submit } = useKitOrderForm(kit);
  const isSiteKit = kit.assignmentTarget === 'site';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const order = submit();
    if (order) {
      onPlaced(order);
    } else {
      // Wait for the error state to render, then move focus to the first invalid field.
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-medium text-slate-900">What's included</h3>
        {kit.description && <p className="mt-1 text-sm text-slate-500">{kit.description}</p>}
        <div className="mt-4">
          <KitItemList lines={kit.lines} />
        </div>
      </section>

      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-5">
        <h3 className="text-sm font-medium text-slate-900">{isSiteKit ? 'Site details' : 'Recipient'}</h3>

        <FormField
          label={isSiteKit ? 'Site name' : 'Full name'}
          error={errors.assignee}
          hint={
            isSiteKit ? (
              'Used for the device names and the network in the dashboard.'
            ) : (
              <>
                For replacement or extra hardware. New starter?{' '}
                <Link to={paths.newOnboarding} className="font-medium text-indigo-600 hover:text-indigo-700">
                  Use onboarding
                </Link>{' '}
                to assign their licences too.
              </>
            )
          }
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              data-autofocus
              value={values.assignee}
              onChange={(event) => setField('assignee', event.target.value)}
              placeholder={isSiteKit ? 'e.g. Leeds Satellite Office' : 'e.g. Lucy Morgan'}
              autoComplete="off"
            />
          )}
        </FormField>

        <FormField
          label={isSiteKit ? 'Go-live date' : 'Needed by'}
          error={errors.startDate}
          hint={`Earliest available: ${formatDate(earliestStartDate)}. Kit arrives the day before (${kit.leadTimeDays}-day lead time).`}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              type="date"
              min={earliestStartDate}
              value={values.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
            />
          )}
        </FormField>

        {!isSiteKit && (
          <FormField label="Deliver to" error={errors.shipTo}>
            {(controlProps) => (
              <Select {...controlProps} value={values.shipTo} onChange={(event) => setField('shipTo', event.target.value)}>
                {sites.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
                <option value={HOME_DELIVERY}>{HOME_DELIVERY}</option>
              </Select>
            )}
          </FormField>
        )}

        <FormField label="Notes for the deployment team" optional>
          {(controlProps) => (
            <Textarea
              {...controlProps}
              value={values.notes}
              onChange={(event) => setField('notes', event.target.value)}
              placeholder={
                isSiteKit ? 'Access hours, cabinet location, ISP details…' : 'Accessibility needs, preferred keyboard layout…'
              }
            />
          )}
        </FormField>
      </form>
    </div>
  );
}
