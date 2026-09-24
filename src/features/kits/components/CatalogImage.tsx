import { useState } from 'react';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { cn } from '../../../lib/cn';
import type { CatalogItem } from '../../../types/catalog';
import { CATALOG_KIND_META } from '../constants/catalogKindMeta';

const SIZE_CLASSES = {
  sm: 'h-10 w-12',
  md: 'h-14 w-18',
  lg: 'h-20 w-28',
} as const;

const ICON_CLASSES = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

interface CatalogImageProps {
  item: CatalogItem;
  size?: keyof typeof SIZE_CLASSES;
}

/**
 * Product thumbnail on a neutral tile. Falls back to the device-type (or kind) icon when the item has
 * no image or it fails to load. Decorative: the item name is always rendered alongside it.
 */
export function CatalogImage({ item, size = 'md' }: CatalogImageProps) {
  const [failed, setFailed] = useState(false);
  const FallbackIcon = item.deviceType ? DEVICE_TYPE_META[item.deviceType].icon : CATALOG_KIND_META[item.kind].icon;
  const showImage = Boolean(item.image) && !failed;

  return (
    <span
      aria-hidden="true"
      className={cn(
        // White tile: manufacturer product shots are photographed on white.
        'flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-slate-400',
        SIZE_CLASSES[size],
      )}
    >
      {showImage ? (
        <img src={item.image} alt="" loading="lazy" onError={() => setFailed(true)} className="size-full object-contain p-0.5" />
      ) : (
        <FallbackIcon className={ICON_CLASSES[size]} />
      )}
    </span>
  );
}
