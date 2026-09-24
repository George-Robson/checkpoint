import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  detail: ReactNode;
  to: string;
}

export function MetricCard({ label, value, icon: Icon, detail, to }: MetricCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon aria-hidden="true" className="size-4 text-slate-400" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value.toLocaleString('en-GB')}</p>
      <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">{detail}</div>
    </Link>
  );
}
