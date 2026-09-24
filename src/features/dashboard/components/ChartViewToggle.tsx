import { ChartColumn, Table2 } from 'lucide-react';
import { SegmentedControl, type SegmentedControlOption } from '../../../components/ui/SegmentedControl';
import type { ChartView } from '../types/chartView';

const OPTIONS: SegmentedControlOption<ChartView>[] = [
  { value: 'chart', label: 'Chart view', icon: ChartColumn, iconOnly: true },
  { value: 'table', label: 'Table view', icon: Table2, iconOnly: true },
];

interface ChartViewToggleProps {
  value: ChartView;
  onChange: (value: ChartView) => void;
}

export function ChartViewToggle({ value, onChange }: ChartViewToggleProps) {
  return <SegmentedControl ariaLabel="Display as" options={OPTIONS} value={value} onChange={onChange} />;
}
