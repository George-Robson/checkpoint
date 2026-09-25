import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { formatCurrency } from '../../../lib/currency';
import type { LicenceBundle } from '../../../types/licenceBundle';
import { useSession } from '../../session/hooks/useSession';
import { useTenant } from '../../tenants/hooks/useTenant';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { useLicences } from '../hooks/useLicences';
import { softwareMonthlyCost } from '../utils/softwareLookup';
import { SoftwarePicker } from './SoftwarePicker';

interface BundleDrawerProps {
  /** Omit to create a new bundle. */
  bundle?: LicenceBundle;
  onClose: () => void;
  onSaved: (message: string) => void;
}

/** Create or edit a client's licence bundle. */
export function BundleDrawer({ bundle, onClose, onSaved }: BundleDrawerProps) {
  const { currentUser } = useSession();
  const { tenants, selectedTenant } = useTenant();
  const { saveBundle, deleteBundle } = useLicences();
  const [tenantId, setTenantId] = useState(bundle?.tenantId ?? selectedTenant?.id ?? '');
  const [name, setName] = useState(bundle?.name ?? '');
  const [description, setDescription] = useState(bundle?.description ?? '');
  const [softwareIds, setSoftwareIds] = useState<string[]>(bundle?.softwareIds ?? []);
  const [submitted, setSubmitted] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const errors = {
    tenantId: !tenantId ? 'Choose the client this bundle belongs to.' : undefined,
    name: name.trim().length < 2 ? 'Give the bundle a name.' : undefined,
    software: softwareIds.length === 0 ? 'Choose at least one licence.' : undefined,
  };
  const valid = !errors.tenantId && !errors.name && !errors.software;

  function toggle(softwareId: string, included: boolean) {
    setSoftwareIds((previous) => (included ? [...previous, softwareId] : previous.filter((id) => id !== softwareId)));
  }

  function save() {
    setSubmitted(true);
    if (!valid) return;
    const saved = saveBundle(
      { tenantId, name: name.trim(), description: description.trim(), softwareIds },
      { bundleId: bundle?.id, editorName: currentUser.name },
    );
    onSaved(`${bundle ? 'Updated' : 'Created'} "${saved.name}" for ${getTenantName(saved.tenantId)} (${saved.softwareIds.length} licences).`);
  }

  function remove() {
    if (!bundle) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteBundle(bundle.id);
    onSaved(`Deleted "${bundle.name}". Licences already assigned from it are unaffected.`);
  }

  return (
    <Drawer
      title={bundle ? `Edit ${bundle.name}` : 'New licence bundle'}
      description="A bundle assigns several licences in one click. Seats are still counted per licence."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm tabular-nums text-slate-500">
            {softwareIds.length} licences · {formatCurrency(softwareMonthlyCost(softwareIds))}/person/mo
          </p>
          <div className="flex gap-2">
            {bundle && (
              <Button variant={confirmingDelete ? 'danger' : 'ghost'} onClick={remove}>
                {confirmingDelete ? 'Confirm delete' : 'Delete'}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>{bundle ? 'Save bundle' : 'Create bundle'}</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {!bundle && !currentUser.tenantId && (
          <FormField label="Client" error={submitted ? errors.tenantId : undefined}>
            {(controlProps) => (
              <Select {...controlProps} value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
                <option value="" disabled>
                  Select a client…
                </option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}
        <FormField label="Name" error={submitted ? errors.name : undefined}>
          {(controlProps) => (
            <Input
              {...controlProps}
              data-autofocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Developer tools"
            />
          )}
        </FormField>
        <FormField label="Description" optional>
          {(controlProps) => (
            <Textarea
              {...controlProps}
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Who it's for"
            />
          )}
        </FormField>
        <div>
          <p className="text-sm font-medium text-slate-900">Licences</p>
          {submitted && errors.software && <p className="mt-1 text-xs text-rose-600">{errors.software}</p>}
          <div className="mt-3">
            <SoftwarePicker selectedIds={softwareIds} onToggle={toggle} columns={1} />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
