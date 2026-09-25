import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/currency';
import type { LicensedPerson } from '../types/licensedPerson';
import type { PoolRow } from '../types/poolRow';

interface LicenceSummaryProps {
  rows: PoolRow[];
  people: LicensedPerson[];
}

/** Headline licence figures for the current scope. */
export function LicenceSummary({ rows, people }: LicenceSummaryProps) {
  const seats = rows.reduce((sum, row) => sum + row.pool.seats, 0);
  const used = rows.reduce((sum, row) => sum + row.used, 0);
  const spend = rows.reduce((sum, row) => sum + row.monthlyCost, 0);
  const unused = rows.reduce((sum, row) => sum + row.unusedCost, 0);
  const licensedPeople = people.filter((person) => person.assignments.length > 0).length;
  const ending = rows.reduce((sum, row) => sum + row.holders.filter((holder) => holder.endsOn).length, 0);

  const stats = [
    { label: 'Seats in use', value: `${used} / ${seats}`, detail: `${seats - used} unassigned${ending ? ` · ${ending} freeing up from leavers` : ''}` },
    { label: 'Licensed people', value: `${licensedPeople}`, detail: `${people.length - licensedPeople} with devices only` },
    { label: 'Monthly software spend', value: formatCurrency(spend), detail: `${rows.length} seat pools` },
    {
      label: 'Unassigned seat cost',
      value: formatCurrency(unused),
      detail: unused > 0 ? 'Review or reduce idle seats' : 'Every seat is in use',
      warn: unused > 0,
    },
  ];

  return (
    <Card>
      <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4">
            <dt className="text-sm text-slate-500">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{stat.value}</dd>
            <dd className={stat.warn ? 'mt-0.5 text-xs text-amber-700' : 'mt-0.5 text-xs text-slate-500'}>{stat.detail}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
