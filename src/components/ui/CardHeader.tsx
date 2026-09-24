import type { ReactNode } from 'react';

interface CardHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, description, actions }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
