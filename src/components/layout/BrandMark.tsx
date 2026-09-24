import { ShieldCheck } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-md bg-indigo-600">
        <ShieldCheck className="size-4 text-white" />
      </span>
      <span className="text-sm font-semibold text-slate-900">Checkpoint IT Group</span>
    </div>
  );
}
