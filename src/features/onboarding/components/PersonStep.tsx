import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { formatDate } from '../../../lib/date';
import { suggestWorkEmail } from '../../../lib/workEmail';
import { useSession } from '../../session/hooks/useSession';
import { useTenant } from '../../tenants/hooks/useTenant';
import type { OnboardingWizard } from '../hooks/useOnboardingWizard';

interface PersonStepProps {
  wizard: OnboardingWizard;
}

export function PersonStep({ wizard }: PersonStepProps) {
  const { currentUser } = useSession();
  const { tenants } = useTenant();
  const { draft, errors, tenant, earliestStart, setField, setTenant } = wizard;
  const email = tenant ? suggestWorkEmail(draft.person, tenant.domain) : null;

  return (
    <Card>
      <CardHeader title="New hire" description="Who is joining, and when they start." />
      <div className="space-y-5 p-4">
        {!currentUser.tenantId && (
          <FormField label="Client" error={errors.tenantId}>
            {(controlProps) => (
              <Select {...controlProps} value={draft.tenantId} onChange={(event) => setTenant(event.target.value)}>
                <option value="" disabled>
                  Select a client…
                </option>
                {tenants.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Full name"
            error={errors.person}
            hint={email ? `Their account will be ${email}` : 'Used for their account and device names.'}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                value={draft.person}
                onChange={(event) => setField('person', event.target.value)}
                placeholder="e.g. Lucy Morgan"
                autoComplete="off"
              />
            )}
          </FormField>
          <FormField label="Job title" optional>
            {(controlProps) => (
              <Input
                {...controlProps}
                value={draft.jobTitle}
                onChange={(event) => setField('jobTitle', event.target.value)}
                placeholder="e.g. Platform Engineer"
                autoComplete="off"
              />
            )}
          </FormField>
        </div>

        <FormField
          label="Start date"
          error={errors.startDate}
          hint={`Licences activate on this day. Earliest: ${formatDate(earliestStart)}.`}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              type="date"
              min={earliestStart}
              value={draft.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
              className="sm:w-56"
            />
          )}
        </FormField>
      </div>
    </Card>
  );
}
