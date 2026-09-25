import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { DUNNING_STEPS, FINAL_NOTICE_AFTER_DAYS, SUSPENSION_NOTICE_DAYS } from '../constants/creditControl';

/** The escalation ladder, so the team can see what happens automatically and what's left to them. */
export function CreditPolicyCard() {
  const steps = [
    ...DUNNING_STEPS,
    {
      day: FINAL_NOTICE_AFTER_DAYS + SUSPENSION_NOTICE_DAYS,
      label: 'Suspension (your decision)',
      description: 'Non-essential services only. Security monitoring, patching and backups continue.',
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Credit control policy"
        description="Reminders, charges and holds happen automatically from the due date. Suspension never does."
      />
      <ol className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step) => (
          <li key={step.label} className="text-sm">
            <p className="text-xs font-medium tabular-nums text-indigo-600">Day {step.day}</p>
            <p className="mt-0.5 font-medium text-slate-900">{step.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
