import type { SoftwareProduct } from '../../../types/software';
import { getSoftwareProduct } from '../utils/softwareLookup';
import { SoftwareLogo } from './SoftwareLogo';

interface SoftwareLogoStackProps {
  softwareIds: string[];
  /** Logos shown before collapsing the rest into "+N". */
  max?: number;
}

/** Overlapping logos for a set of licences (bundles, a person's licences). */
export function SoftwareLogoStack({ softwareIds, max = 5 }: SoftwareLogoStackProps) {
  const products = softwareIds.flatMap((id): SoftwareProduct[] => {
    const product = getSoftwareProduct(id);
    return product ? [product] : [];
  });
  const extra = products.length - max;

  return (
    <span className="flex items-center" title={products.map((product) => product.name).join(', ')}>
      {products.slice(0, max).map((product, index) => (
        <SoftwareLogo key={product.id} product={product} size="sm" className={index > 0 ? '-ml-1.5 ring-2 ring-white' : 'ring-2 ring-white'} />
      ))}
      {extra > 0 && <span className="ml-1.5 text-xs tabular-nums text-slate-500">+{extra}</span>}
    </span>
  );
}
