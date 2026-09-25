import { Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/paths';
import type { AccountStanding } from '../types/creditControl';
import { ACCOUNT_STAGE_META } from '../constants/accountStageMeta';

interface AccountRestrictedNoticeProps {
  standing: AccountStanding;
  clientName: string;
  /** What's blocked, e.g. "New orders". */
  action: string;
}

/** Explains why an order or onboarding can't be placed for a client with overdue invoices. */
export function AccountRestrictedNotice({ standing, clientName, action }: AccountRestrictedNoticeProps) {
  return (
    <div role="alert" className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
      <Ban aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rose-600" />
      <p>
        {action} for {clientName} are paused ({ACCOUNT_STAGE_META[standing.stage].label.toLowerCase()}) until overdue
        invoices are paid.{' '}
        <Link to={paths.invoices} className="font-medium text-rose-700 hover:text-rose-800">
          View invoices
        </Link>
      </p>
    </div>
  );
}
