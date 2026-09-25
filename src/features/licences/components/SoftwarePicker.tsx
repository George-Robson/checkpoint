import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { FilterSelect, type FilterSelectOption } from '../../../components/ui/FilterSelect';
import { SearchInput } from '../../../components/ui/SearchInput';
import { ToggleChip } from '../../../components/ui/ToggleChip';
import { softwareProducts } from '../../../data/mockData';
import type { SoftwareCategory } from '../../../types/software';
import { SOFTWARE_CATEGORY_META, SOFTWARE_CATEGORY_ORDER } from '../constants/softwareCategoryMeta';
import type { SeatAvailability } from '../types/seatAvailability';
import { SeatNote } from './SeatNote';
import { SoftwareOption } from './SoftwareOption';

type CategoryFilter = SoftwareCategory | 'all';

const CATEGORY_OPTIONS: FilterSelectOption<CategoryFilter>[] = [
  { value: 'all', label: 'All categories' },
  ...SOFTWARE_CATEGORY_ORDER.map((category) => ({ value: category, label: SOFTWARE_CATEGORY_META[category].label })),
];

interface SoftwarePickerProps {
  selectedIds: string[];
  onToggle: (softwareId: string, included: boolean) => void;
  /** Always included and can't be unticked (e.g. the client's baseline). */
  lockedIds?: string[];
  lockedLabel?: string;
  /** Tagged as recommended (e.g. by the chosen kit). */
  recommendedIds?: string[];
  recommendedLabel?: string;
  /** Seat pools for the client; when given, each option explains its seat impact. */
  availability?: Map<string, SeatAvailability>;
  /** Licences the person already holds (no new seat needed). */
  heldIds?: string[];
  /** Two columns on wide pages; one in narrow panels such as drawers. */
  columns?: 1 | 2;
}

/** The software catalogue as a searchable, categorised checklist. Shared by onboarding, licences, bundles and kits. */
export function SoftwarePicker({
  selectedIds,
  onToggle,
  lockedIds = [],
  lockedLabel = 'Baseline',
  recommendedIds = [],
  recommendedLabel = 'Recommended',
  availability,
  heldIds = [],
  columns = 2,
}: SoftwarePickerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const selected = new Set(selectedIds);
  const locked = new Set(lockedIds);
  const recommended = new Set(recommendedIds);
  const held = new Set(heldIds);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedCount = softwareProducts.filter((product) => locked.has(product.id) || selected.has(product.id)).length;

  const visible = softwareProducts.filter(
    (product) =>
      (category === 'all' || product.category === category) &&
      (!selectedOnly || locked.has(product.id) || selected.has(product.id)) &&
      (!normalizedQuery ||
        `${product.name} ${product.vendor} ${product.detail}`.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search software or vendors…"
          aria-label="Search software"
          className="w-full sm:w-64"
        />
        <FilterSelect
          label="Filter by category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
          active={category !== 'all'}
        />
        <ToggleChip pressed={selectedOnly} onPressedChange={setSelectedOnly}>
          Selected only
        </ToggleChip>
        <p className="ml-auto text-sm tabular-nums text-slate-500">{selectedCount} selected</p>
      </div>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No software matches. Try another search or category.
        </p>
      )}

      {SOFTWARE_CATEGORY_ORDER.map((categoryId) => {
        const products = visible.filter((product) => product.category === categoryId);
        if (products.length === 0) return null;
        const { label, icon: Icon } = SOFTWARE_CATEGORY_META[categoryId];

        return (
          <section key={categoryId}>
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </h4>
            <div className={columns === 2 ? 'mt-2 grid gap-3 sm:grid-cols-2' : 'mt-2 grid gap-3'}>
              {products.map((product) => {
                const isLocked = locked.has(product.id);
                const isChecked = isLocked || selected.has(product.id);
                return (
                  <SoftwareOption
                    key={product.id}
                    product={product}
                    checked={isChecked}
                    disabled={isLocked}
                    onChange={(checked) => onToggle(product.id, checked)}
                    badge={
                      isLocked ? (
                        <Badge tone="slate">{lockedLabel}</Badge>
                      ) : recommended.has(product.id) ? (
                        <Badge tone="indigo">{recommendedLabel}</Badge>
                      ) : undefined
                    }
                    note={
                      availability ? (
                        <SeatNote
                          product={product}
                          availability={availability.get(product.id)}
                          held={held.has(product.id)}
                          selected={isChecked}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
