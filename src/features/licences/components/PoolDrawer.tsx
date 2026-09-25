import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { QuantityStepper } from '../../../components/ui/QuantityStepper';
import { Select } from '../../../components/ui/Select';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { initialsFor } from '../../../lib/initials';
import { useSession } from '../../session/hooks/useSession';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { useLicences } from '../hooks/useLicences';
import type { LicensedPerson } from '../types/licensedPerson';
import type { PoolRow } from '../types/poolRow';
import { describeLicenceChange } from '../utils/describeLicenceChange';

/** Seats can grow well beyond current use (e.g. ahead of a hiring wave). */
const MAX_EXTRA_SEATS = 50;

interface PoolDrawerProps {
  row: PoolRow;
  people: LicensedPerson[];
  onClose: () => void;
  onChanged: (message: string) => void;
}

/** Resize a seat pool and manage who holds it. */
export function PoolDrawer({ row, people, onClose, onChanged }: PoolDrawerProps) {
  const { currentUser } = useSession();
  const { changeLicences, setPoolSeats } = useLicences();
  const [seats, setSeats] = useState(row.pool.seats);
  const [assigneeKey, setAssigneeKey] = useState('');
  const { product, pool, holders } = row;

  const candidates = people.filter(
    (person) => person.tenantId === pool.tenantId && !holders.some((holder) => holder.person === person.name),
  );

  function remove(personName: string) {
    const result = changeLicences({
      tenantId: pool.tenantId,
      person: personName,
      add: [],
      remove: [product.id],
      startsOn: null,
      changedBy: currentUser.name,
    });
    onChanged(`${describeLicenceChange(personName, result)} The seat stays in the pool.`);
  }

  function assign() {
    const person = candidates.find((candidate) => candidate.key === assigneeKey);
    if (!person) return;
    const result = changeLicences({
      tenantId: pool.tenantId,
      person: person.name,
      add: [product.id],
      remove: [],
      startsOn: person.startsOn,
      changedBy: currentUser.name,
    });
    setAssigneeKey('');
    setSeats((previous) => Math.max(previous, holders.length + 1));
    onChanged(describeLicenceChange(person.name, result));
  }

  function saveSeats() {
    setPoolSeats(pool.id, seats);
    onChanged(`${product.name} for ${getTenantName(pool.tenantId)}: ${seats} seats.`);
    onClose();
  }

  return (
    <Drawer
      title={product.name}
      description={`${getTenantName(pool.tenantId)} · ${formatCurrency(product.monthlyPricePerSeat)}/seat/month · renews ${formatDate(pool.renewalDate)}`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm tabular-nums text-slate-500">
            {formatCurrency(seats * product.monthlyPricePerSeat)}/month for {seats} seats
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
            <Button onClick={saveSeats} disabled={seats === pool.seats}>
              Save seats
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-medium text-slate-900">Seats</h3>
          <div className="mt-3 flex items-center gap-4">
            <QuantityStepper
              value={seats}
              onChange={setSeats}
              label={`${product.name} seats`}
              min={holders.length}
              max={holders.length + MAX_EXTRA_SEATS}
            />
            <p className="text-sm text-slate-500">
              {holders.length} in use · {Math.max(0, seats - holders.length)} idle
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Can't go below the seats in use; remove someone's licence first to free a seat.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-medium text-slate-900">Assigned to ({holders.length})</h3>
          {holders.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Nobody holds this licence yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {holders.map((holder) => (
                <li key={holder.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600"
                  >
                    {initialsFor(holder.person)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-900">{holder.person}</span>
                    <span className="block text-xs text-slate-500">
                      Assigned {formatDate(holder.assignedAt)} by {holder.assignedBy}
                    </span>
                  </span>
                  {holder.status === 'scheduled' && holder.startsOn && (
                    <Badge tone="indigo">Starts {formatDate(holder.startsOn)}</Badge>
                  )}
                  {holder.endsOn && <Badge tone="amber">Ends {formatDate(holder.endsOn)}</Badge>}
                  <button
                    type="button"
                    onClick={() => remove(holder.person)}
                    aria-label={`Remove ${product.name} from ${holder.person}`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="text-sm font-medium text-slate-900">Assign to someone</h3>
          {candidates.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Everyone at {getTenantName(pool.tenantId)} already has it.</p>
          ) : (
            <div className="mt-3 flex gap-2">
              <div className="flex-1">
                <Select
                  aria-label="Person to assign"
                  value={assigneeKey}
                  onChange={(event) => setAssigneeKey(event.target.value)}
                >
                  <option value="" disabled>
                    Select a person…
                  </option>
                  {candidates.map((candidate) => (
                    <option key={candidate.key} value={candidate.key}>
                      {candidate.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button variant="secondary" onClick={assign} disabled={!assigneeKey}>
                Assign
              </Button>
            </div>
          )}
          {row.free === 0 && candidates.length > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              All seats are in use: assigning adds a seat (+{formatCurrency(product.monthlyPricePerSeat)}/mo).
            </p>
          )}
        </section>
      </div>
    </Drawer>
  );
}
