import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { formatCurrency } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import type { OnboardingWizard } from '../hooks/useOnboardingWizard';
import { NO_KIT } from '../types/onboardingDraft';

interface OnboardingSummaryPanelProps {
  wizard: OnboardingWizard;
}

/** Running totals beside the wizard so cost is visible while choosing. */
export function OnboardingSummaryPanel({ wizard }: OnboardingSummaryPanelProps) {
  const { draft, tenant, selectedKit, softwareIds, seatsToBuy, hardwareMonthly, softwareMonthly } = wizard;

  const rows = [
    { label: 'New hire', value: draft.person.trim() || '—' },
    { label: 'Client', value: tenant?.name ?? '—' },
    { label: 'Starts', value: draft.startDate ? formatDate(draft.startDate) : '—' },
    {
      label: 'Hardware',
      value: selectedKit ? selectedKit.name : draft.kitId === NO_KIT ? 'None' : 'Not chosen yet',
    },
    { label: 'Licences', value: `${softwareIds.length}` },
  ];

  return (
    <Card>
      <CardHeader title="Summary" />
      <dl className="space-y-2 px-4 py-4 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="truncate text-right text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <dl className="space-y-2 border-t border-slate-100 px-4 py-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Hardware lease</dt>
          <dd className="tabular-nums text-slate-900">{formatCurrency(hardwareMonthly)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Software licences</dt>
          <dd className="tabular-nums text-slate-900">{formatCurrency(softwareMonthly)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-3">
          <dt className="font-medium text-slate-900">Total</dt>
          <dd>
            <span className="text-lg font-semibold text-slate-900">{formatCurrency(hardwareMonthly + softwareMonthly)}</span>
            <span className="text-slate-500"> / month</span>
          </dd>
        </div>
      </dl>
      {seatsToBuy.length > 0 && (
        <p className="border-t border-slate-100 px-4 py-3 text-xs text-amber-700">
          {seatsToBuy.length} {seatsToBuy.length === 1 ? 'licence needs' : 'licences need'} a new seat; the pool grows
          automatically.
        </p>
      )}
    </Card>
  );
}
