import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/SearchInput';
import { SegmentedControl, type SegmentedControlOption } from '../../../components/ui/SegmentedControl';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { catalogItems } from '../../../data/mockData';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import type { CatalogItemKind } from '../../../types/catalog';
import type { Kit } from '../../../types/kit';
import { CATALOG_KIND_META, CATALOG_KIND_ORDER } from '../constants/catalogKindMeta';
import { specSummary } from '../utils/specSummary';
import { CatalogImage } from './CatalogImage';

type KindFilter = CatalogItemKind | 'all';

const KIND_OPTIONS: SegmentedControlOption<KindFilter>[] = [
  { value: 'all', label: 'All' },
  ...CATALOG_KIND_ORDER.map((kind) => ({ value: kind, label: CATALOG_KIND_META[kind].shortLabel })),
];

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';
const CELL = 'px-3 py-3 first:pl-4 last:pr-4';

interface CatalogTableProps {
  /** Kits visible to the user, for the "Used in" count. */
  kits: Kit[];
}

export function CatalogTable({ kits }: CatalogTableProps) {
  const [kind, setKind] = useState<KindFilter>('all');
  const [query, setQuery] = useState('');

  const usageById = useMemo(() => {
    const usage = new Map<string, number>();
    for (const kit of kits) {
      for (const line of kit.lines) usage.set(line.catalogItemId, (usage.get(line.catalogItemId) ?? 0) + 1);
    }
    return usage;
  }, [kits]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = catalogItems.filter(
    (item) =>
      (kind === 'all' || item.kind === kind) &&
      (!normalizedQuery || `${item.name} ${item.vendor} ${item.detail}`.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
        <SegmentedControl ariaLabel="Item type" options={KIND_OPTIONS} value={kind} onChange={setKind} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search items or vendors…"
          aria-label="Search catalogue"
          className="w-full sm:ml-auto sm:w-64"
        />
      </div>

      {visibleItems.length === 0 ? (
        <EmptyState icon={SearchX} title="No matching items" description="Try another search or item type." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className={HEADER_CELL}>
                  Item
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Type
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Vendor
                </th>
                <th scope="col" className={`${HEADER_CELL} text-right`}>
                  Used in
                </th>
                <th scope="col" className={`${HEADER_CELL} text-right`}>
                  Monthly price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleItems.map((item) => {
                const { icon: KindIcon, shortLabel } = CATALOG_KIND_META[item.kind];
                const usage = usageById.get(item.id) ?? 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className={CELL}>
                      <div className="flex items-center gap-3">
                        <CatalogImage item={item} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.detail}</p>
                          {item.specs && <p className="text-xs text-slate-700">{specSummary(item)}</p>}
                        </div>
                      </div>
                    </td>
                    <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>
                      <span className="inline-flex items-center gap-2">
                        <KindIcon aria-hidden="true" className="size-4 text-slate-400" />
                        {item.deviceType ? DEVICE_TYPE_META[item.deviceType].label : shortLabel}
                      </span>
                    </td>
                    <td className={cn(CELL, 'whitespace-nowrap text-slate-700')}>{item.vendor}</td>
                    <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-500')}>
                      {usage === 0 ? '—' : `${usage} ${usage === 1 ? 'kit' : 'kits'}`}
                    </td>
                    <td className={cn(CELL, 'whitespace-nowrap text-right tabular-nums text-slate-900')}>
                      {formatCurrency(item.monthlyPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
