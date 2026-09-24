import { softwareProducts } from '../../../data/mockData';
import type { SoftwareProduct } from '../../../types/software';

const softwareById = new Map(softwareProducts.map((product) => [product.id, product]));

export function getSoftwareProduct(softwareId: string): SoftwareProduct | undefined {
  return softwareById.get(softwareId);
}

/** Monthly cost of a set of licences (unknown ids are ignored). */
export function softwareMonthlyCost(softwareIds: string[]): number {
  return softwareIds.reduce((sum, id) => sum + (getSoftwareProduct(id)?.monthlyPricePerSeat ?? 0), 0);
}
