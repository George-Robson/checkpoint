export interface ChartLegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span aria-hidden="true" className="size-2 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
