import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** What is being counted, for the button labels (e.g. "Dell UltraSharp U2724DE"). */
  label: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({ value, onChange, label, min = 1, max = 20, disabled = false }: QuantityStepperProps) {
  const buttonClasses =
    'flex size-7 items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className={buttonClasses}
      >
        <Minus aria-hidden="true" className="size-3.5" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm tabular-nums text-slate-900">
        {value}
      </span>
      <button
        type="button"
        aria-label={`More ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={buttonClasses}
      >
        <Plus aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}
