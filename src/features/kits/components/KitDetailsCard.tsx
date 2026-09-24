import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { RadioGroup } from '../../../components/ui/RadioGroup';
import { Textarea } from '../../../components/ui/Textarea';
import type { KitBuilderErrors } from '../types/kitBuilder';
import type { KitDraft } from '../types/kitDraft';
import { KitIconPicker } from './KitIconPicker';

interface KitDetailsCardProps {
  draft: KitDraft;
  errors: KitBuilderErrors;
  setField: <K extends keyof KitDraft>(field: K, value: KitDraft[K]) => void;
}

export function KitDetailsCard({ draft, errors, setField }: KitDetailsCardProps) {
  return (
    <Card>
      <CardHeader title="Details" description="How the kit appears in the storefront." />
      <div className="space-y-5 p-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Name" error={errors.name}>
            {(controlProps) => (
              <Input
                {...controlProps}
                data-autofocus
                value={draft.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="e.g. Warehouse Handheld Kit"
              />
            )}
          </FormField>
          <FormField label="Audience" hint="Shown as a tag on the card." optional>
            {(controlProps) => (
              <Input
                {...controlProps}
                value={draft.audience}
                onChange={(event) => setField('audience', event.target.value)}
                placeholder="e.g. Warehouse operations"
              />
            )}
          </FormField>
        </div>

        <FormField label="Tagline" optional>
          {(controlProps) => (
            <Input
              {...controlProps}
              value={draft.tagline}
              onChange={(event) => setField('tagline', event.target.value)}
              placeholder="One line on who it's for"
            />
          )}
        </FormField>

        <FormField label="Description" hint="Shown to whoever places the order." optional>
          {(controlProps) => (
            <Textarea
              {...controlProps}
              value={draft.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          )}
        </FormField>

        <KitIconPicker value={draft.icon} onChange={(icon) => setField('icon', icon)} />

        <div className="grid gap-5 sm:grid-cols-2">
          <RadioGroup
            name="kit-assignment"
            legend="Ordered for"
            value={draft.assignmentTarget}
            onChange={(value) => setField('assignmentTarget', value)}
            options={[
              { value: 'user', label: 'A new hire', description: 'Asks for their name and start date.' },
              { value: 'site', label: 'A new site', description: 'Asks for a site name and go-live date.' },
            ]}
          />
          <FormField
            label="Lead time (days)"
            error={errors.leadTimeDays}
            hint="Working days from order to delivery, including imaging and enrolment."
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                type="number"
                min={1}
                max={30}
                value={Number.isNaN(draft.leadTimeDays) ? '' : draft.leadTimeDays}
                onChange={(event) => setField('leadTimeDays', event.target.valueAsNumber)}
                className="w-28"
              />
            )}
          </FormField>
        </div>
      </div>
    </Card>
  );
}
