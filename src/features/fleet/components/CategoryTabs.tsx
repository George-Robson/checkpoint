import { LayoutGrid } from 'lucide-react';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { DEVICE_CATEGORY_META, DEVICE_CATEGORY_ORDER } from '../../../constants/deviceCategory';
import type { FleetCategoryFilter } from '../types/fleetFilters';

interface CategoryTabsProps {
  value: FleetCategoryFilter;
  counts: Record<FleetCategoryFilter, number>;
  onChange: (value: FleetCategoryFilter) => void;
  controls: string;
}

export function CategoryTabs({ value, counts, onChange, controls }: CategoryTabsProps) {
  const items: TabItem<FleetCategoryFilter>[] = [
    { value: 'all', label: 'All devices', icon: LayoutGrid, count: counts.all },
    ...DEVICE_CATEGORY_ORDER.map((category) => ({
      value: category,
      label: DEVICE_CATEGORY_META[category].label,
      icon: DEVICE_CATEGORY_META[category].icon,
      count: counts[category],
    })),
  ];

  return <Tabs items={items} value={value} onChange={onChange} ariaLabel="Device category" controls={controls} />;
}
