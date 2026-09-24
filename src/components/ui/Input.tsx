import type { InputHTMLAttributes } from 'react';
import { inputClasses } from './inputStyles';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';
  return <input className={inputClasses(invalid, `h-9 ${className ?? ''}`)} {...props} />;
}
