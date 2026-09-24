import { catalogItems } from '../../../data/mockData';
import type { CatalogItem } from '../../../types/catalog';

const catalogById = new Map(catalogItems.map((item) => [item.id, item]));

export function getCatalogItem(catalogItemId: string): CatalogItem | undefined {
  return catalogById.get(catalogItemId);
}
