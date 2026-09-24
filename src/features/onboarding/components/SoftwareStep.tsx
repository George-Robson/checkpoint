import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { SoftwarePicker } from '../../licences/components/SoftwarePicker';
import type { OnboardingWizard } from '../hooks/useOnboardingWizard';

interface SoftwareStepProps {
  wizard: OnboardingWizard;
}

export function SoftwareStep({ wizard }: SoftwareStepProps) {
  const { tenant, selectedKit, baselineIds, softwareIds, availability, toggleSoftware } = wizard;

  return (
    <Card>
      <CardHeader
        title="Software licences"
        description={
          <>
            {tenant?.name ?? 'The client'}'s baseline is always included.
            {selectedKit && ` Recommendations for the ${selectedKit.name} are pre-selected.`} Seats come from{' '}
            {tenant?.name ?? 'the client'}'s pools and activate on the start date.
          </>
        }
      />
      <div className="p-4">
        <SoftwarePicker
          selectedIds={softwareIds}
          onToggle={toggleSoftware}
          lockedIds={baselineIds}
          lockedLabel="Baseline"
          recommendedIds={selectedKit?.recommendedSoftwareIds ?? []}
          recommendedLabel="Recommended for kit"
          availability={availability}
        />
      </div>
    </Card>
  );
}
