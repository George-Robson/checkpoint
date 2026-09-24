import type { CatalogItem, CatalogItemKind } from '../../../types/catalog';
import type { KitLine } from '../../../types/kit';
import { getCatalogItem } from './catalogLookup';

export interface ResolvedKitLine {
  item: CatalogItem;
  quantity: number;
  /** Monthly cost of this line (unit price × quantity). */
  total: number;
}

/** Joins kit lines to the catalogue, dropping any that reference unknown items. */
export function resolveKitLines(lines: KitLine[]): ResolvedKitLine[] {
  return lines.flatMap((line) => {
    const item = getCatalogItem(line.catalogItemId);
    return item ? [{ item, quantity: line.quantity, total: item.monthlyPrice * line.quantity }] : [];
  });
}

export function kitMonthlyPrice(lines: KitLine[]): number {
  return resolveKitLines(lines).reduce((sum, line) => sum + line.total, 0);
}

export function kitPriceByKind(lines: KitLine[]): Record<CatalogItemKind, number> {
  const totals: Record<CatalogItemKind, number> = { hardware: 0, peripheral: 0 };
  for (const line of resolveKitLines(lines)) totals[line.item.kind] += line.total;
  return totals;
}

/** Units per kind (a pair of monitors counts as two peripherals). */
export function kitUnitsByKind(lines: KitLine[]): Record<CatalogItemKind, number> {
  const counts: Record<CatalogItemKind, number> = { hardware: 0, peripheral: 0 };
  for (const line of resolveKitLines(lines)) counts[line.item.kind] += line.quantity;
  return counts;
}
