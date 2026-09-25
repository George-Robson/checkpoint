import { CircleAlert, TriangleAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { cn } from '../../../lib/cn';
import { useTenant } from '../../tenants/hooks/useTenant';
import { useAccountStanding } from '../hooks/useAccountStanding';
import { describeStanding } from '../utils/describeStanding';

/** Shown across the app while the selected client has overdue invoices, so nobody is surprised by a hold. */
export function AccountStandingBanner() {
  const { selectedTenant } = useTenant();
  const { pathname } = useLocation();
  const standing = useAccountStanding(selectedTenant?.id);
  if (!selectedTenant || !standing || standing.stage === 'good-standing') return null;

  const severe = standing.stage === 'final-notice' || standing.stage === 'suspended';
  const Icon = severe ? CircleAlert : TriangleAlert;

  return (
    <div
      role="status"
      className={cn(
        'mb-6 flex flex-col gap-2 rounded-lg border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        severe ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900',
      )}
    >
      <p className="flex gap-3">
        <Icon aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', severe ? 'text-rose-600' : 'text-amber-600')} />
        {describeStanding(standing, selectedTenant.name)}
      </p>
      {pathname !== paths.invoices && (
        <Link
          to={paths.invoices}
          className={cn(
            'shrink-0 pl-7 font-medium sm:pl-0',
            severe ? 'text-rose-700 hover:text-rose-800' : 'text-amber-800 hover:text-amber-900',
          )}
        >
          View invoices
        </Link>
      )}
    </div>
  );
}
