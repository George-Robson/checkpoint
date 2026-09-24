import { RefreshCw, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FilterSelect, type FilterSelectOption } from '../../../components/ui/FilterSelect';
import { SearchInput } from '../../../components/ui/SearchInput';
import { ToggleChip } from '../../../components/ui/ToggleChip';
import { DEVICE_STATUS_META, DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import { REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import type { DeviceStatus, DeviceType } from '../../../types/device';
import { DEVICE_TYPE_META, DEVICE_TYPE_ORDER } from '../../../constants/deviceType';
import type { FleetFilters } from '../types/fleetFilters';

const STATUS_OPTIONS: FilterSelectOption<DeviceStatus | 'all'>[] = [
  { value: 'all', label: 'All statuses' },
  ...DEVICE_STATUS_ORDER.map((status) => ({ value: status, label: DEVICE_STATUS_META[status].label })),
];

interface FleetToolbarProps {
  filters: FleetFilters;
  /** Types offered in the type filter (limited to the selected category). */
  availableTypes: DeviceType[];
  resultCount: number;
  hasActiveFilters: boolean;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: DeviceStatus | 'all') => void;
  onTypeChange: (type: DeviceType | 'all') => void;
  onLeaseDueChange: (leaseDue: boolean) => void;
  onClearFilters: () => void;
}

export function FleetToolbar({
  filters,
  availableTypes,
  resultCount,
  hasActiveFilters,
  onQueryChange,
  onStatusChange,
  onTypeChange,
  onLeaseDueChange,
  onClearFilters,
}: FleetToolbarProps) {
  const typeOptions: FilterSelectOption<DeviceType | 'all'>[] = [
    { value: 'all', label: 'All types' },
    ...DEVICE_TYPE_ORDER.filter((type) => availableTypes.includes(type)).map((type) => ({
      value: type,
      label: DEVICE_TYPE_META[type].label,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={filters.query}
        onChange={onQueryChange}
        placeholder="Search name, user, IP or MAC…"
        aria-label="Search devices"
        className="w-full sm:w-72"
      />
      <FilterSelect
        label="Filter by status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={onStatusChange}
        active={filters.status !== 'all'}
      />
      <FilterSelect
        label="Filter by device type"
        value={filters.type}
        options={typeOptions}
        onChange={onTypeChange}
        active={filters.type !== 'all'}
      />
      <ToggleChip
        pressed={filters.leaseDue}
        onPressedChange={onLeaseDueChange}
        icon={RefreshCw}
      >
        Due for refresh
        <span className="sr-only"> (lease ends within {REFRESH_WINDOW_DAYS} days)</span>
      </ToggleChip>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X aria-hidden="true" className="size-3.5" />
          Clear filters
        </Button>
      )}
      <p aria-live="polite" className="ml-auto text-sm tabular-nums text-slate-500">
        {resultCount} {resultCount === 1 ? 'device' : 'devices'}
      </p>
    </div>
  );
}
