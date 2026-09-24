import type { TextareaHTMLAttributes } from 'react';
import { inputClasses } from './inputStyles';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';
  return <textarea rows={rows} className={inputClasses(invalid, `resize-none py-2 ${className ?? ''}`)} {...props} />;
}
