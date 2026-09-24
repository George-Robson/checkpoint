import type { KitLine } from '../../../types/kit';
import { CATALOG_KIND_META, CATALOG_KIND_ORDER } from '../constants/catalogKindMeta';
import { resolveKitLines } from '../utils/kitPricing';
import { CatalogImage } from './CatalogImage';
import { SpecList } from './SpecList';

interface KitItemListProps {
  lines: KitLine[];
}

/** Read-only contents of a kit, grouped by kind, with the full spec sheet for each device. */
export function KitItemList({ lines }: KitItemListProps) {
  const resolved = resolveKitLines(lines);

  return (
    <div className="space-y-5">
      {CATALOG_KIND_ORDER.map((kind) => {
        const kindLines = resolved.filter((line) => line.item.kind === kind);
        if (kindLines.length === 0) return null;
        const { label } = CATALOG_KIND_META[kind];

        return (
          <section key={kind}>
            <h4 className="text-xs font-medium text-slate-500">{label}</h4>
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {kindLines.map((line) => (
                <li key={line.item.id} className="flex items-start gap-3 px-3 py-2.5">
                  <CatalogImage item={line.item} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{line.item.name}</p>
                    <p className="text-xs text-slate-500">{line.item.detail}</p>
                    {line.item.specs && (
                      <div className="mt-2 rounded-md bg-slate-50 px-3 py-2">
                        <SpecList specs={line.item.specs} />
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-slate-500">×{line.quantity}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
