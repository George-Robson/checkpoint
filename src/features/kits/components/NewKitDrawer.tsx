import { useId, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { newKitPath } from '../../../app/paths';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { FormField } from '../../../components/ui/FormField';
import { RadioGroup, type RadioOption } from '../../../components/ui/RadioGroup';
import { Select } from '../../../components/ui/Select';
import { formatCurrency } from '../../../lib/currency';
import { useSession } from '../../session/hooks/useSession';
import { canManageTemplates } from '../../session/utils/permissions';
import { useTenant } from '../../tenants/hooks/useTenant';
import { useKits } from '../hooks/useKits';
import { kitMonthlyPrice, resolveKitLines } from '../utils/kitPricing';

const LIBRARY = 'library';
const BLANK = 'blank';

interface NewKitDrawerProps {
  onClose: () => void;
}

/** Step one of creating a kit: who it's for and what to start from. The builder does the rest. */
export function NewKitDrawer({ onClose }: NewKitDrawerProps) {
  const formId = useId();
  const navigate = useNavigate();
  const { currentUser } = useSession();
  const { tenants, selectedTenant } = useTenant();
  const { kits } = useKits();
  const templates = kits.filter((kit) => kit.ownerTenantId === null);

  const [owner, setOwner] = useState(currentUser.tenantId ?? selectedTenant?.id ?? '');
  const [start, setStart] = useState(templates[0]?.id ?? BLANK);
  const [showError, setShowError] = useState(false);

  const startOptions: RadioOption<string>[] = [
    ...templates.map((template) => ({
      value: template.id,
      label: template.name,
      description: `${resolveKitLines(template.lines)
        .filter((line) => line.item.kind === 'hardware')
        .map((line) => line.item.name)
        .join(', ')} · ${formatCurrency(kitMonthlyPrice(template.lines))}/mo`,
    })),
    { value: BLANK, label: 'Start from scratch', description: 'An empty kit: choose every item yourself.' },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!owner) {
      setShowError(true);
      return;
    }
    navigate(newKitPath(owner, start === BLANK ? undefined : start));
  }

  return (
    <Drawer
      title="New kit"
      description="Copies are independent: later changes to a template never alter kits made from it."
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Continue
          </Button>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-6">
        {!currentUser.tenantId && (
          <FormField
            label="Create for"
            error={showError && !owner ? 'Choose who this kit is for.' : undefined}
            hint={owner === LIBRARY ? 'Templates are available for every client to copy.' : undefined}
          >
            {(controlProps) => (
              <Select
                {...controlProps}
                data-autofocus
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
              >
                <option value="" disabled>
                  Select a client…
                </option>
                {canManageTemplates(currentUser) && <option value={LIBRARY}>Checkpoint template library</option>}
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}

        <RadioGroup name="kit-start" legend="Starting point" value={start} options={startOptions} onChange={setStart} />
      </form>
    </Drawer>
  );
}
