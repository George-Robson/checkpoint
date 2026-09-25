import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { useSession } from '../../session/hooks/useSession';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { useLicences } from '../hooks/useLicences';
import { useSeatAvailability } from '../hooks/useSeatAvailability';
import type { LicensedPerson } from '../types/licensedPerson';
import { describeLicenceChange } from '../utils/describeLicenceChange';
import { softwareMonthlyCost } from '../utils/softwareLookup';
import { BundlePicker } from './BundlePicker';
import { SoftwarePicker } from './SoftwarePicker';

interface PersonLicencesDrawerProps {
  people: LicensedPerson[];
  /** Preselected person; when omitted the drawer asks who to manage. */
  personKey?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}

/** Add or remove licences for an existing person (or a new hire before they start). */
export function PersonLicencesDrawer({ people, personKey, onClose, onSaved }: PersonLicencesDrawerProps) {
  const { currentUser } = useSession();
  const { changeLicences, baselines, bundles } = useLicences();
  const [selectedKey, setSelectedKey] = useState(personKey ?? '');
  const person = people.find((candidate) => candidate.key === selectedKey) ?? null;
  const heldIds = person?.assignments.map((assignment) => assignment.softwareId) ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>(heldIds);
  const availability = useSeatAvailability(person?.tenantId ?? null);
  const baselineIds = person ? (baselines[person.tenantId] ?? []) : [];

  const add = selectedIds.filter((id) => !heldIds.includes(id));
  const remove = heldIds.filter((id) => !selectedIds.includes(id));
  const costChange = softwareMonthlyCost(add) - softwareMonthlyCost(remove);

  function choosePerson(key: string) {
    setSelectedKey(key);
    setSelectedIds(people.find((candidate) => candidate.key === key)?.assignments.map((a) => a.softwareId) ?? []);
  }

  function toggle(softwareId: string, included: boolean) {
    toggleMany([softwareId], included);
  }

  function toggleMany(softwareIds: string[], included: boolean) {
    setSelectedIds((previous) =>
      included ? [...new Set([...previous, ...softwareIds])] : previous.filter((id) => !softwareIds.includes(id)),
    );
  }

  function save() {
    if (!person) return;
    const result = changeLicences({
      tenantId: person.tenantId,
      person: person.name,
      add,
      remove,
      // New hires keep their licences scheduled for the start date.
      startsOn: person.startsOn,
      changedBy: currentUser.name,
    });
    onSaved(describeLicenceChange(person.name, result));
  }

  const changeSummary =
    add.length + remove.length === 0
      ? 'No changes'
      : `${add.length ? `+${add.length}` : ''}${add.length && remove.length ? ' · ' : ''}${remove.length ? `−${remove.length}` : ''} · ${costChange >= 0 ? '+' : '−'}${formatCurrency(Math.abs(costChange))}/mo`;

  return (
    <Drawer
      title={person ? `${person.name}'s licences` : 'Manage licences'}
      description={
        person
          ? `${getTenantName(person.tenantId)}${person.startsOn ? ` · starts ${formatDate(person.startsOn)}` : ''}`
          : 'Choose someone to add or remove licences.'
      }
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm tabular-nums text-slate-500">{person ? changeSummary : ''}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!person || add.length + remove.length === 0}>
              Save changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {!personKey && (
          <FormField label="Person" hint="Anyone with a device or licence in the current scope.">
            {(controlProps) => (
              <Select
                {...controlProps}
                data-autofocus
                value={selectedKey}
                onChange={(event) => choosePerson(event.target.value)}
              >
                <option value="" disabled>
                  Select a person…
                </option>
                {people.map((candidate) => (
                  <option key={candidate.key} value={candidate.key}>
                    {candidate.name} · {getTenantName(candidate.tenantId)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}

        {person && (
          <BundlePicker
            bundles={bundles.filter((bundle) => bundle.tenantId === person.tenantId)}
            selectedIds={selectedIds}
            onToggle={(bundle, included) => toggleMany(bundle.softwareIds, included)}
          />
        )}

        {person && (
          <SoftwarePicker
            selectedIds={selectedIds}
            onToggle={toggle}
            recommendedIds={baselineIds}
            recommendedLabel="Baseline"
            availability={availability}
            heldIds={heldIds}
            columns={1}
          />
        )}
      </div>
    </Drawer>
  );
}
