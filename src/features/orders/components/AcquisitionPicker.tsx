import { LEASE_TERM_MONTHS, WARRANTY_MONTHS } from '../../../data/mockData';
import { cn } from '../../../lib/cn';
import { formatCurrency } from '../../../lib/currency';
import type { Acquisition } from '../../../types/acquisition';
import type { KitLine } from '../../../types/kit';
import { costOverTerm, kitCost, leaseBreakdown } from '../../kits/utils/kitPricing';
import { ACQUISITION_META, ACQUISITION_ORDER } from '../constants/acquisitionMeta';

interface AcquisitionPickerProps {
  name: string;
  lines: KitLine[];
  value: Acquisition;
  onChange: (acquisition: Acquisition) => void;
}

const DESCRIPTIONS: Record<Acquisition, string> = {
  lease: `${LEASE_TERM_MONTHS}-month term. Management, support, warranty and returns included; refreshed at the end.`,
  purchase: `The client owns the hardware. ${WARRANTY_MONTHS / 12}-year warranty; Checkpoint still manages the devices.`,
};

/** Lease or buy outright, with each option's price and the total over a lease term. */
export function AcquisitionPicker({ name, lines, value, onChange }: AcquisitionPickerProps) {
  const costs = { lease: kitCost(lines, 'lease'), purchase: kitCost(lines, 'purchase') };
  const lease = leaseBreakdown(lines);

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-900">Payment</legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {ACQUISITION_ORDER.map((option) => {
          const checked = option === value;
          const cost = costs[option];
          return (
            <label
              key={option}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600',
                checked ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="mt-0.5 size-4 shrink-0 accent-indigo-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">{ACQUISITION_META[option].label}</span>
                <span className="mt-0.5 block text-sm tabular-nums text-slate-900">
                  {option === 'lease' ? formatCurrency(cost.monthly) : formatCurrency(cost.upfront)}
                  <span className="text-slate-500">{option === 'lease' ? ' / month' : ' one-off'}</span>
                </span>
                {cost.monthly > 0 && (
                  <span
                    className="block text-xs tabular-nums text-slate-500"
                    title={
                      option === 'lease'
                        ? `${formatCurrency(lease.hardware)} hardware + ${formatCurrency(lease.management)} management`
                        : undefined
                    }
                  >
                    {option === 'lease'
                      ? `incl. ${formatCurrency(lease.management)}/mo management`
                      : `+ ${formatCurrency(cost.monthly)}/mo management`}
                  </span>
                )}
                <span className="mt-1.5 block text-xs text-slate-500">{DESCRIPTIONS[option]}</span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs tabular-nums text-slate-500">
        Over {LEASE_TERM_MONTHS} months: leasing {formatCurrency(costOverTerm(costs.lease))} · buying{' '}
        {formatCurrency(costOverTerm(costs.purchase))}, both including management.
      </p>
    </fieldset>
  );
}
