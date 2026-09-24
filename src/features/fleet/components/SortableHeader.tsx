import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../lib/cn';
import type { DeviceSort, DeviceSortKey } from '../types/deviceSort';

interface SortableHeaderProps {
  label: string;
  sortKey: DeviceSortKey;
  sort: DeviceSort;
  onSort: (key: DeviceSortKey) => void;
}

export function SortableHeader({ label, sortKey, sort, onSort }: SortableHeaderProps) {
  const isActive = sort.key === sortKey;
  const Icon = !isActive ? ChevronsUpDown : sort.direction === 'asc' ? ChevronUp : ChevronDown;
  const ariaSort = !isActive ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending';

  return (
    <th scope="col" aria-sort={ariaSort} className="whitespace-nowrap px-3 py-3 text-left first:pl-4 last:pr-4">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'group -mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium hover:text-slate-900',
          isActive ? 'text-slate-900' : 'text-slate-500',
        )}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={cn('size-3.5', isActive ? 'text-slate-500' : 'text-slate-300 group-hover:text-slate-400')}
        />
      </button>
    </th>
  );
}
