import type { ReactNode } from 'react';

export interface ChartTooltipRow {
  label: string;
  value: ReactNode;
  color?: string;
}

interface ChartTooltipProps {
  title: string;
  rows: ChartTooltipRow[];
  footer?: ReactNode;
}

export function ChartTooltip({ title, rows, footer }: ChartTooltipProps) {
  return (
    <div className="min-w-44 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-slate-900">{title}</p>
      <dl className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-slate-500">
              {row.color && (
                <span aria-hidden="true" className="size-2 rounded-sm" style={{ backgroundColor: row.color }} />
              )}
              {row.label}
            </dt>
            <dd className="tabular-nums text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-2 border-t border-slate-100 pt-2 text-slate-500">{footer}</div>}
    </div>
  );
}
