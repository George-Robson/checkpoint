import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../lib/currency';
import { useSession } from '../../session/hooks/useSession';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { useLicences } from '../hooks/useLicences';
import type { LicensedPerson } from '../types/licensedPerson';
import { getSoftwareProduct, softwareMonthlyCost } from '../utils/softwareLookup';
import { SoftwarePicker } from './SoftwarePicker';

const PREVIEW_COUNT = 5;

interface BaselineEditorProps {
  tenantId: string;
  people: LicensedPerson[];
  onNotice: (message: string) => void;
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

/** Edit a client's baseline, then optionally roll it out to existing staff who don't have it. */
export function BaselineEditor({ tenantId, people, onNotice }: BaselineEditorProps) {
  const { currentUser } = useSession();
  const { baselines, setBaseline, changeLicences } = useLicences();
  const saved = baselines[tenantId] ?? [];
  const [selected, setSelected] = useState<string[]>(saved);
  const dirty = !sameSet(selected, saved);
  const tenantName = getTenantName(tenantId);

  // Current staff (leavers excluded) who lack part of the saved baseline.
  const missing = people
    .filter((person) => person.tenantId === tenantId && !person.endsOn)
    .map((person) => ({
      person,
      softwareIds: saved.filter((id) => !person.assignments.some((assignment) => assignment.softwareId === id)),
    }))
    .filter((entry) => entry.softwareIds.length > 0);

  function toggle(softwareId: string, included: boolean) {
    setSelected((previous) => (included ? [...previous, softwareId] : previous.filter((id) => id !== softwareId)));
  }

  function save() {
    setBaseline(tenantId, selected);
    onNotice(`${tenantName}'s baseline now has ${selected.length} products. New hires get it automatically.`);
  }

  function rollOut() {
    let assigned = 0;
    let seatsBought = 0;
    for (const { person, softwareIds } of missing) {
      const result = changeLicences({
        tenantId,
        person: person.name,
        add: softwareIds,
        remove: [],
        startsOn: person.startsOn,
        changedBy: currentUser.name,
      });
      assigned += result.added;
      seatsBought += result.seatsAdded.reduce((sum, entry) => sum + entry.count, 0);
    }
    onNotice(
      `Assigned ${assigned} baseline licences across ${missing.length} people at ${tenantName}.` +
        (seatsBought ? ` ${seatsBought} ${seatsBought === 1 ? 'seat was' : 'seats were'} added to full pools.` : ''),
    );
  }

  return (
    <div className="grid gap-6 p-4 lg:grid-cols-3 [&>*]:min-w-0">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <h3 className="text-sm font-medium text-slate-900">Always included for {tenantName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Every new hire gets these, and they can't be removed during onboarding. Changing the baseline doesn't
            touch existing staff; roll it out separately.
          </p>
        </div>
        <SoftwarePicker selectedIds={selected} onToggle={toggle} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Baseline cost</p>
          <p className="mt-1">
            <span className="text-xl font-semibold text-slate-900">{formatCurrency(softwareMonthlyCost(selected))}</span>
            <span className="text-sm text-slate-500"> / person / month</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{selected.length} products</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={!dirty}>
              Save baseline
            </Button>
            {dirty && (
              <Button variant="ghost" onClick={() => setSelected(saved)}>
                Discard
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-900">Existing staff</p>
          {missing.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">Everyone at {tenantName} has the full baseline.</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-500">
                {missing.length} {missing.length === 1 ? 'person is' : 'people are'} missing part of the saved baseline:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {missing.slice(0, PREVIEW_COUNT).map(({ person, softwareIds }) => (
                  <li key={person.key}>
                    <span className="font-medium text-slate-900">{person.name}</span>:{' '}
                    {softwareIds.map((id) => getSoftwareProduct(id)?.name ?? id).join(', ')}
                  </li>
                ))}
                {missing.length > PREVIEW_COUNT && <li>and {missing.length - PREVIEW_COUNT} more</li>}
              </ul>
              <Button variant="secondary" size="sm" className="mt-3" onClick={rollOut} disabled={dirty}>
                Assign to {missing.length === 1 ? 'them' : `all ${missing.length}`}
              </Button>
              {dirty && <p className="mt-2 text-xs text-slate-500">Save the baseline first to roll out your changes.</p>}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
