import { formatCurrency } from '../../../lib/currency';
import type { KitCost } from '../../kits/utils/kitPricing';

/** One line for summaries: "£76/mo", or "£2,140 one-off + £10/mo management". */
export function describeKitCost(cost: KitCost): string {
  if (cost.upfront === 0) return `${formatCurrency(cost.monthly)}/mo`;
  const management = cost.monthly > 0 ? ` + ${formatCurrency(cost.monthly)}/mo management` : '';
  return `${formatCurrency(cost.upfront)} one-off${management}`;
}
