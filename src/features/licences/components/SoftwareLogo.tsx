import { useState } from 'react';
import { cn } from '../../../lib/cn';
import { initialsFor } from '../../../lib/initials';
import type { SoftwareProduct } from '../../../types/software';
import { SIMPLE_ICON_LOGOS } from '../constants/simpleIconLogos';

const TILE_SIZES = { xs: 'size-6', sm: 'size-7', md: 'size-9', lg: 'size-11' } as const;
const MARK_SIZES = { xs: 'size-3.5', sm: 'size-4', md: 'size-5', lg: 'size-6' } as const;

/** Very light brand colours (e.g. Intercom mint) would vanish on white, so they sit on a dark tile. */
function isLightColour(hex: string): boolean {
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.7;
}

interface SoftwareLogoProps {
  product: Pick<SoftwareProduct, 'name' | 'vendor' | 'logo'>;
  size?: keyof typeof TILE_SIZES;
  className?: string;
}

/**
 * A product's logo on a small square tile: a Simple Icons mark in its brand colour, an official logo
 * image, or (if neither is available) the vendor's initials. Decorative; the name is always shown alongside.
 */
export function SoftwareLogo({ product, size = 'md', className }: SoftwareLogoProps) {
  const [failed, setFailed] = useState(false);
  const icon = product.logo && !product.logo.startsWith('/') ? SIMPLE_ICON_LOGOS[product.logo] : undefined;
  const src = product.logo?.startsWith('/') ? product.logo : undefined;
  const tile = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-md border',
    TILE_SIZES[size],
    className,
  );

  if (icon) {
    const light = isLightColour(icon.hex);
    return (
      <span aria-hidden="true" className={cn(tile, light ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')}>
        <svg viewBox="0 0 24 24" className={MARK_SIZES[size]} fill={`#${icon.hex}`}>
          <path d={icon.path} />
        </svg>
      </span>
    );
  }

  if (src && !failed) {
    return (
      <span aria-hidden="true" className={cn(tile, 'border-slate-200 bg-white')}>
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="size-full object-contain p-1" />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={cn(tile, 'border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600')}>
      {initialsFor(product.vendor || product.name)}
    </span>
  );
}
