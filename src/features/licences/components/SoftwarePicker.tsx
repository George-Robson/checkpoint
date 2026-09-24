import { Badge } from '../../../components/ui/Badge';
import { softwareProducts } from '../../../data/mockData';
import { SOFTWARE_CATEGORY_META, SOFTWARE_CATEGORY_ORDER } from '../constants/softwareCategoryMeta';
import type { SeatAvailability } from '../types/seatAvailability';
import { SeatNote } from './SeatNote';
import { SoftwareOption } from './SoftwareOption';

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

/** Software catalogue as a categorised checklist. Shared by onboarding, licence management and kits. */
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
  const selected = new Set(selectedIds);
  const locked = new Set(lockedIds);
  const recommended = new Set(recommendedIds);
  const held = new Set(heldIds);

  return (
    <div className="space-y-6">
      {SOFTWARE_CATEGORY_ORDER.map((category) => {
        const products = softwareProducts.filter((product) => product.category === category);
        if (products.length === 0) return null;
        const { label, icon: Icon } = SOFTWARE_CATEGORY_META[category];

        return (
          <section key={category}>
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
