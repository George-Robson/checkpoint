import { Copy, CopyPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { kitPath, newKitPath } from '../../../app/paths';
import { Badge } from '../../../components/ui/Badge';
import { buttonClasses } from '../../../components/ui/buttonStyles';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import { formatDateTime, formatRelativeTime } from '../../../lib/date';
import type { Kit } from '../../../types/kit';
import { useSession } from '../../session/hooks/useSession';
import { canEditKit } from '../../session/utils/permissions';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { describeContents } from '../utils/describeContents';
import { kitMonthlyPrice } from '../utils/kitPricing';
import { KitIconBadge } from './KitIconBadge';

const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface KitsTableRowProps {
  kit: Kit;
  templateName: string | undefined;
  showClient: boolean;
  showOrigin: boolean;
  isHighlighted: boolean;
}

export function KitsTableRow({ kit, templateName, showClient, showOrigin, isHighlighted }: KitsTableRowProps) {
  const { currentUser } = useSession();
  const editable = canEditKit(currentUser, kit);
  const isTemplate = kit.ownerTenantId === null;
  // Client admins can't edit templates, but can copy one into their own organisation.
  const copyOwner = editable ? (kit.ownerTenantId ?? 'library') : currentUser.tenantId;

  return (
    <tr className={cn('transition-colors', isHighlighted ? 'bg-indigo-50/60' : 'hover:bg-slate-50')}>
      <td className={CELL}>
        <div className="flex items-center gap-3">
          <KitIconBadge icon={kit.icon} size="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <Link to={kitPath(kit.id)} className="whitespace-nowrap font-medium text-slate-900 hover:text-indigo-600">
                {kit.name}
              </Link>
              {isHighlighted && <Badge tone="indigo">Saved</Badge>}
            </p>
            <p className="whitespace-nowrap text-xs text-slate-500" title={kit.tagline}>
              {describeContents(kit.lines)}
            </p>
          </div>
        </div>
      </td>
      {showClient && (
        <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>
          {kit.ownerTenantId ? getTenantName(kit.ownerTenantId) : '—'}
        </td>
      )}
      {showOrigin && (
        <td className={cn(CELL, 'whitespace-nowrap')}>
          {templateName ? (
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <Copy aria-hidden="true" className="size-3.5 text-slate-400" />
              {templateName}
            </span>
          ) : (
            <span className="text-slate-500">Built from scratch</span>
          )}
        </td>
      )}
      <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-900')}>
        {formatCurrency(kitMonthlyPrice(kit.lines))}
        <span className="text-slate-500"> /mo</span>
      </td>
      <td className={CELL}>
        <time dateTime={kit.updatedAt} title={formatDateTime(kit.updatedAt)} className="whitespace-nowrap text-slate-700">
          {formatRelativeTime(kit.updatedAt)}
        </time>
        <p className="whitespace-nowrap text-xs text-slate-500">{kit.updatedBy}</p>
      </td>
      <td className={cn(CELL, 'text-right')}>
        <div className="flex justify-end gap-2">
          <Link to={kitPath(kit.id)} className={buttonClasses('secondary', 'sm')}>
            {editable ? 'Edit' : 'View'}
          </Link>
          {copyOwner && (
            <Link
              to={newKitPath(copyOwner, kit.id)}
              className={buttonClasses('ghost', 'sm')}
              title={isTemplate && !editable ? 'Use this template for your organisation' : 'Duplicate this kit'}
            >
              <CopyPlus aria-hidden="true" className="size-3.5" />
              {isTemplate && !editable ? 'Use template' : 'Duplicate'}
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
