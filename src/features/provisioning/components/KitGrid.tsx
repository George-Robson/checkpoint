import { KitCard } from '../../kits/components/KitCard';
import type { ClientKit } from '../../kits/utils/isClientKit';

interface KitGridProps {
  kits: ClientKit[];
  onSelect: (kit: ClientKit) => void;
}

export function KitGrid({ kits, onSelect }: KitGridProps) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {kits.map((kit) => (
        <li key={kit.id} className="flex">
          <KitCard kit={kit} onSelect={() => onSelect(kit)} />
        </li>
      ))}
    </ul>
  );
}
