import { ArrowRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import type { Tenant } from '../../../types/tenant';
import { TenantAvatar } from '../../tenants/components/TenantAvatar';

interface StorefrontClientPickerProps {
  tenants: Tenant[];
  kitCountByTenant: Map<string, number>;
  onSelect: (tenantId: string) => void;
}

/** Global View has no single catalogue, so ask which client's storefront to open. */
export function StorefrontClientPicker({ tenants, kitCountByTenant, onSelect }: StorefrontClientPickerProps) {
  return (
    <Card>
      <CardHeader
        title="Choose a client"
        description="Every client has its own kit catalogue. Pick one to see their storefront and place orders."
      />
      <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {tenants.map((tenant) => {
          const kitCount = kitCountByTenant.get(tenant.id) ?? 0;
          return (
            <li key={tenant.id}>
              <button
                type="button"
                onClick={() => onSelect(tenant.id)}
                className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <TenantAvatar tenant={tenant} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">{tenant.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {kitCount} {kitCount === 1 ? 'kit' : 'kits'} · {tenant.plan}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
