import { Layers } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { LicenceBundle } from '../../../types/licenceBundle';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { softwareMonthlyCost } from '../utils/softwareLookup';
import { SoftwareLogoStack } from './SoftwareLogoStack';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface BundlesTableProps {
  bundles: LicenceBundle[];
  showTenant: boolean;
  onEdit: (bundleId: string) => void;
  onCreate: () => void;
}

export function BundlesTable({ bundles, showTenant, onEdit, onCreate }: BundlesTableProps) {
  if (bundles.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No bundles yet"
        description="Group licences that go together, like 'Developer tools', so they can be assigned in one click."
        action={
          <Button size="sm" onClick={onCreate}>
            New bundle
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              Bundle
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
              Per person
            </th>
            <th scope="col" className={HEADER_CELL}>
              Last updated
            </th>
            <th scope="col" className={HEADER_CELL}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bundles.map((bundle) => (
            <tr key={bundle.id} className="hover:bg-slate-50">
              <td className={CELL}>
                <p className="font-medium text-slate-900">{bundle.name}</p>
                <p className="max-w-sm truncate text-xs text-slate-500">{bundle.description || '—'}</p>
              </td>
              {showTenant && <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{getTenantName(bundle.tenantId)}</td>}
              <td className={CELL}>
                <div className="flex items-center gap-3">
                  <SoftwareLogoStack softwareIds={bundle.softwareIds} />
                  <span className="whitespace-nowrap text-xs text-slate-500">{bundle.softwareIds.length} licences</span>
                </div>
              </td>
              <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-900')}>
                {formatCurrency(softwareMonthlyCost(bundle.softwareIds))}
                <span className="text-slate-500">/mo</span>
              </td>
              <td className={CELL}>
                <time dateTime={bundle.updatedAt} title={formatDateTime(bundle.updatedAt)} className="whitespace-nowrap text-slate-700">
                  {formatRelativeTime(bundle.updatedAt)}
                </time>
                <p className="whitespace-nowrap text-xs text-slate-500">{bundle.updatedBy}</p>
              </td>
              <td className={cn(CELL, 'text-right')}>
                <Button variant="secondary" size="sm" onClick={() => onEdit(bundle.id)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
