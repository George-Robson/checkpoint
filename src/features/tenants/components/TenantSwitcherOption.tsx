import { Check } from 'lucide-react';
import type { Tenant } from '../../../types/tenant';
import { TenantAvatar } from './TenantAvatar';

interface TenantSwitcherOptionProps {
  tenant: Tenant | null;
  label: string;
  meta: string;
  selected: boolean;
  onSelect: () => void;
}

export function TenantSwitcherOption({ tenant, label, meta, selected, onSelect }: TenantSwitcherOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <TenantAvatar tenant={tenant} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900">{label}</span>
        <span className="block truncate text-xs text-slate-500">{meta}</span>
      </span>
      {selected && <Check aria-hidden="true" className="size-4 shrink-0 text-indigo-600" />}
    </button>
  );
}
