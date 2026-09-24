import type { LicenceAssignment, LicencePool } from '../../../types/licence';
import type { SoftwareProduct } from '../../../types/software';

/** A seat pool joined to its product and current holders. */
export interface PoolRow {
  pool: LicencePool;
  product: SoftwareProduct;
  holders: LicenceAssignment[];
  used: number;
  free: number;
  monthlyCost: number;
  unusedCost: number;
}
