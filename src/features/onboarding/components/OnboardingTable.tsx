import type { ReactNode } from 'react';
import type { Kit } from '../../../types/kit';
import type { Onboarding } from '../../../types/onboarding';
import type { Order } from '../../../types/order';
import { OnboardingRow } from './OnboardingRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';

interface OnboardingTableProps {
  onboardings: Onboarding[];
  kitById: Map<string, Kit>;
  orderById: Map<string, Order>;
  showTenant: boolean;
  highlightId: string | null;
  empty: ReactNode;
}

export function OnboardingTable({ onboardings, kitById, orderById, showTenant, highlightId, empty }: OnboardingTableProps) {
  if (onboardings.length === 0) return <>{empty}</>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={HEADER_CELL}>
              New hire
            </th>
            {showTenant && (
              <th scope="col" className={HEADER_CELL}>
                Client
              </th>
            )}
            <th scope="col" className={HEADER_CELL}>
              Starts
            </th>
            <th scope="col" className={HEADER_CELL}>
              Hardware
            </th>
            <th scope="col" className={HEADER_CELL}>
              Software
            </th>
            <th scope="col" className={HEADER_CELL}>
              Status
            </th>
            <th scope="col" className={HEADER_CELL}>
              Request
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {onboardings.map((onboarding) => (
            <OnboardingRow
              key={onboarding.id}
              onboarding={onboarding}
              kit={onboarding.kitId ? kitById.get(onboarding.kitId) : undefined}
              order={onboarding.orderId ? orderById.get(onboarding.orderId) : undefined}
              showTenant={showTenant}
              isNew={onboarding.id === highlightId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
