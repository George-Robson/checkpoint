import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import type { KitLine } from '../../../types/kit';
import { CATALOG_KIND_META } from '../constants/catalogKindMeta';
import { getCatalogItem } from '../utils/catalogLookup';
import { CatalogPickerModal } from './CatalogPickerModal';
import { KitLineRow } from './KitLineRow';

interface KitLinesCardProps {
  kind: 'hardware' | 'peripheral';
  lines: KitLine[];
  error?: string;
  onAdd: (catalogItemId: string) => void;
  onQuantityChange: (catalogItemId: string, quantity: number) => void;
  onRemove: (catalogItemId: string) => void;
}

/** Hardware or peripherals: quantity-based lines, added by browsing the catalogue. */
export function KitLinesCard({ kind, lines, error, onAdd, onQuantityChange, onRemove }: KitLinesCardProps) {
  const meta = CATALOG_KIND_META[kind];
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleAdd(catalogItemIds: string[]) {
    catalogItemIds.forEach(onAdd);
    setPickerOpen(false);
  }

  return (
    <Card>
      <CardHeader
        title={meta.label}
        description={meta.description}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)} aria-invalid={Boolean(error)}>
            <Plus aria-hidden="true" className="size-3.5" />
            Browse {meta.shortLabel.toLowerCase()}
          </Button>
        }
      />

      {lines.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {lines.map((line) => {
            const item = getCatalogItem(line.catalogItemId);
            if (!item) return null;
            return (
              <KitLineRow
                key={item.id}
                item={item}
                quantity={line.quantity}
                onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
                onRemove={() => onRemove(item.id)}
              />
            );
          })}
        </ul>
      ) : (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-slate-500">No {meta.shortLabel.toLowerCase()} in this kit yet.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setPickerOpen(true)}>
            <Plus aria-hidden="true" className="size-3.5" />
            Browse the catalogue
          </Button>
        </div>
      )}

      {error && <p className="border-t border-slate-200 px-4 py-2.5 text-xs text-rose-600">{error}</p>}

      {pickerOpen && (
        <CatalogPickerModal
          kind={kind}
          inKitIds={new Set(lines.map((line) => line.catalogItemId))}
          onAdd={handleAdd}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Card>
  );
}
