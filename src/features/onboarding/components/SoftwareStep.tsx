import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { BundlePicker } from '../../licences/components/BundlePicker';
import { SoftwarePicker } from '../../licences/components/SoftwarePicker';
import { useLicences } from '../../licences/hooks/useLicences';
import type { OnboardingWizard } from '../hooks/useOnboardingWizard';

interface SoftwareStepProps {
  wizard: OnboardingWizard;
}

export function SoftwareStep({ wizard }: SoftwareStepProps) {
  const { draft, tenant, selectedKit, baselineIds, softwareIds, availability, toggleSoftware, toggleSoftwareMany } = wizard;
  const { bundles } = useLicences();
  const tenantBundles = bundles.filter((bundle) => bundle.tenantId === draft.tenantId);

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
      <div className="space-y-6 p-4">
        <BundlePicker
          bundles={tenantBundles}
          selectedIds={softwareIds}
          onToggle={(bundle, included) => toggleSoftwareMany(bundle.softwareIds, included)}
        />
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
