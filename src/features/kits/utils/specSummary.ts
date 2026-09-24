import type { CatalogItem } from '../../../types/catalog';

const SUMMARY_SPEC_COUNT = 3;

/** The headline specs on one line, e.g. "Intel Core Ultra 9 185H · 64 GB LPDDR5x · 2 TB NVMe SSD". */
export function specSummary(item: CatalogItem): string {
  if (!item.specs?.length) return item.detail;
  return item.specs
    .slice(0, SUMMARY_SPEC_COUNT)
    .map((spec) => spec.value)
    .join(' · ');
}
