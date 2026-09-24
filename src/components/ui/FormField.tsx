import { useId, type ReactNode } from 'react';

export interface FormControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface FormFieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Receives the id/aria wiring to spread onto the control. */
  children: (controlProps: FormControlProps) => ReactNode;
}

export function FormField({ label, hint, error, optional = false, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-900">
        {label}
        {optional && <span className="font-normal text-slate-500"> (optional)</span>}
      </label>
      <div className="mt-1.5">
        {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
