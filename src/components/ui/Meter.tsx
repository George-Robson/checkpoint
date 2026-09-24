interface MeterProps {
  value: number;
  max: number;
  label: string;
}

/** Thin usage bar: fill and track are two steps of the same hue so the whole bar reads as one quantity. */
export function Meter({ value, max, label }: MeterProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 w-full overflow-hidden rounded-sm bg-indigo-100"
    >
      <div className="h-full rounded-sm bg-indigo-600" style={{ width: `${percent}%` }} />
    </div>
  );
}
