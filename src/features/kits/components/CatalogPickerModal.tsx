import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FilterSelect, type FilterSelectOption } from '../../../components/ui/FilterSelect';
import { Modal } from '../../../components/ui/Modal';
import { SearchInput } from '../../../components/ui/SearchInput';
import { SegmentedControl, type SegmentedControlOption } from '../../../components/ui/SegmentedControl';
import { DEVICE_CATEGORY_META, DEVICE_CATEGORY_ORDER } from '../../../constants/deviceCategory';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { catalogItems } from '../../../data/mockData';
import { formatCurrency } from '../../../lib/currency';
import type { CatalogItem } from '../../../types/catalog';
import type { DeviceCategory } from '../../../types/device';
import { CATALOG_KIND_META } from '../constants/catalogKindMeta';
import { CatalogPickerItem } from './CatalogPickerItem';

type CategoryFilter = DeviceCategory | 'all';
type SortOrder = 'catalogue' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: FilterSelectOption<SortOrder>[] = [
  { value: 'catalogue', label: 'Default order' },
  { value: 'price-asc', label: 'Lowest price' },
  { value: 'price-desc', label: 'Highest price' },
];

function itemCategory(item: CatalogItem): DeviceCategory | null {
  return item.deviceType ? DEVICE_TYPE_META[item.deviceType].category : null;
}

function matchesQuery(item: CatalogItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return [item.name, item.vendor, item.detail, ...(item.specs ?? []).map((spec) => spec.value)]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery);
}

interface CatalogPickerModalProps {
  kind: 'hardware' | 'peripheral';
  /** Items already in the kit: listed, but can't be added twice. */
  inKitIds: Set<string>;
  onAdd: (catalogItemIds: string[]) => void;
  onClose: () => void;
}

/** Browse the catalogue with specs, then add one or more items to the kit at once. */
export function CatalogPickerModal({ kind, inKitIds, onAdd, onClose }: CatalogPickerModalProps) {
  const meta = CATALOG_KIND_META[kind];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOrder>('catalogue');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const kindItems = useMemo(() => catalogItems.filter((item) => item.kind === kind), [kind]);

  // Hardware can be narrowed by fleet category; only categories that have items are offered.
  const categoryOptions: SegmentedControlOption<CategoryFilter>[] = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...DEVICE_CATEGORY_ORDER.filter((option) => kindItems.some((item) => itemCategory(item) === option)).map(
        (option) => ({ value: option, label: DEVICE_CATEGORY_META[option].label }),
      ),
    ],
    [kindItems],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = kindItems
    .filter((item) => (category === 'all' || itemCategory(item) === category) && matchesQuery(item, normalizedQuery))
    .sort((a, b) => (sort === 'price-asc' ? a.monthlyPrice - b.monthlyPrice : sort === 'price-desc' ? b.monthlyPrice - a.monthlyPrice : 0));

  const selectedTotal = selectedIds.reduce(
    (sum, id) => sum + (kindItems.find((item) => item.id === id)?.monthlyPrice ?? 0),
    0,
  );

  function toggle(itemId: string, selected: boolean) {
    setSelectedIds((previous) => (selected ? [...previous, itemId] : previous.filter((id) => id !== itemId)));
  }

  return (
    <Modal
      title={`Add ${meta.shortLabel.toLowerCase()}`}
      description={meta.description}
      onClose={onClose}
      toolbar={
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={kind === 'hardware' ? 'Search models, processors, memory…' : 'Search peripherals…'}
            aria-label={`Search ${meta.shortLabel.toLowerCase()}`}
            data-autofocus
            className="w-full sm:min-w-0 sm:flex-1"
          />
          {kind === 'hardware' && categoryOptions.length > 2 && (
            <SegmentedControl ariaLabel="Category" options={categoryOptions} value={category} onChange={setCategory} />
          )}
          <FilterSelect label="Sort items" value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {selectedIds.length === 0
              ? 'Select items to add'
              : `${selectedIds.length} selected · +${formatCurrency(selectedTotal)}/mo`}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={selectedIds.length === 0} onClick={() => onAdd(selectedIds)}>
              {selectedIds.length > 1 ? `Add ${selectedIds.length} items` : 'Add to kit'}
            </Button>
          </div>
        </div>
      }
    >
      {visibleItems.length === 0 ? (
        <EmptyState icon={SearchX} title="No matching items" description="Try a different search or category." />
      ) : (
        <ul className="space-y-3" aria-label={`${meta.shortLabel} catalogue`}>
          {visibleItems.map((item) => (
            <CatalogPickerItem
              key={item.id}
              item={item}
              inKit={inKitIds.has(item.id)}
              selected={selectedIds.includes(item.id)}
              onToggle={(selected) => toggle(item.id, selected)}
            />
          ))}
        </ul>
      )}
    </Modal>
  );
}
