import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { BundlePicker } from '../../licences/components/BundlePicker';
import { SoftwarePicker } from '../../licences/components/SoftwarePicker';
import { useLicences } from '../../licences/hooks/useLicences';

interface KitRecommendedSoftwareCardProps {
  selectedIds: string[];
  onToggle: (softwareId: string, included: boolean) => void;
  /** Site kits aren't assigned to a person, so there's nobody to license. */
  disabled: boolean;
  /** The client that owns the kit (null for templates): its bundles are offered as quick picks. */
  ownerTenantId: string | null;
}

export function KitRecommendedSoftwareCard({ selectedIds, onToggle, disabled, ownerTenantId }: KitRecommendedSoftwareCardProps) {
  const { bundles } = useLicences();
  const ownerBundles = ownerTenantId ? bundles.filter((bundle) => bundle.tenantId === ownerTenantId) : [];
  return (
    <Card>
      <CardHeader
        title="Recommended software"
        description={
          disabled
            ? 'Site kits aren’t assigned to a person, so they have no software licences.'
            : `Pre-selected when onboarding someone with this kit. Licences are assigned per person and billed separately. ${selectedIds.length} selected.`
        }
      />
      {!disabled && (
        <div className="space-y-6 p-4">
          <BundlePicker
            bundles={ownerBundles}
            selectedIds={selectedIds}
            onToggle={(bundle, included) =>
              bundle.softwareIds.forEach((id) => {
                if (included !== selectedIds.includes(id)) onToggle(id, included);
              })
            }
          />
          <SoftwarePicker selectedIds={selectedIds} onToggle={onToggle} />
        </div>
      )}
    </Card>
  );
}
