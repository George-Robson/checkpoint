import { Users } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { initialsFor } from '../../../lib/initials';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import type { LicensedPerson } from '../types/licensedPerson';
import { softwareMonthlyCost } from '../utils/softwareLookup';
import { SoftwareLogoStack } from './SoftwareLogoStack';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';
const VISIBLE_LOGOS = 6;

interface PeopleTableProps {
  people: LicensedPerson[];
  showTenant: boolean;
  onManage: (personKey: string) => void;
}

export function PeopleTable({ people, showTenant, onManage }: PeopleTableProps) {
  if (people.length === 0) {
    return <EmptyState icon={Users} title="No people" description="Nobody in this scope has a licence or device." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Person
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={HEADER_CELL}>
              Licences
            </th>
            <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
              Monthly cost
            </th>
            <th scope="col" className={HEADER_CELL}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {people.map((person) => {
            const softwareIds = person.assignments.map((assignment) => assignment.softwareId);
            return (
              <tr key={person.key} className="hover:bg-slate-50">
                <td className={CELL}>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600"
                    >
                      {initialsFor(person.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-900">
                        {person.name}
                        {person.startsOn && <Badge tone="indigo">Starts {formatDate(person.startsOn)}</Badge>}
                        {person.endsOn && <Badge tone="amber">Leaving · licences end {formatDate(person.endsOn)}</Badge>}
                      </p>
                      <p className="whitespace-nowrap text-xs text-slate-500">
                        {person.deviceCount} {person.deviceCount === 1 ? 'device' : 'devices'}
                      </p>
                    </div>
                  </div>
                </td>
                {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(person.tenantId)}</td>}
                <td className={CELL}>
                  {softwareIds.length === 0 ? (
                    <span className="text-slate-400">No licences</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <SoftwareLogoStack softwareIds={softwareIds} max={VISIBLE_LOGOS} />
                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {softwareIds.length} {softwareIds.length === 1 ? 'licence' : 'licences'}
                      </span>
                    </div>
                  )}
                </td>
                <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-900')}>
                  {formatCurrency(softwareMonthlyCost(softwareIds))}
                </td>
                <td className={cn(CELL, 'text-right')}>
                  <Button variant="secondary" size="sm" onClick={() => onManage(person.key)}>
                    Manage
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
