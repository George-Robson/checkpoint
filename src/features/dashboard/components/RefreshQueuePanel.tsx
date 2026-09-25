import { ArrowRight, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import { cn } from '../../../lib/cn';
import type { RefreshQueueItem } from '../types/refreshQueueItem';
import { RefreshQueueRow } from './RefreshQueueRow';

interface RefreshQueuePanelProps {
  items: RefreshQueueItem[];
  showTenant: boolean;
  className?: string;
}

export function RefreshQueuePanel({ items, showTenant, className }: RefreshQueuePanelProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Due for refresh" description={`Leases ending within ${REFRESH_WINDOW_DAYS} days`} />
      {items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nothing due"
          description={`No leases or warranties end in the next ${REFRESH_WINDOW_DAYS} days.`}
        />
      ) : (
        <>
          <ul className="max-h-96 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto lg:max-h-none">
            {items.map((item) => (
              <RefreshQueueRow key={item.device.id} item={item} showTenant={showTenant} />
            ))}
          </ul>
          <div className="border-t border-slate-200 px-4 py-2.5">
            <Link
              to={`${paths.fleet}?lease=due`}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View in Fleet
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
