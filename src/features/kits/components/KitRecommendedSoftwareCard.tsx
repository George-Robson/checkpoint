import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { SoftwarePicker } from '../../licences/components/SoftwarePicker';

interface KitRecommendedSoftwareCardProps {
  selectedIds: string[];
  onToggle: (softwareId: string, included: boolean) => void;
  /** Site kits aren't assigned to a person, so there's nobody to license. */
  disabled: boolean;
}

export function KitRecommendedSoftwareCard({ selectedIds, onToggle, disabled }: KitRecommendedSoftwareCardProps) {
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
        <div className="p-4">
          <SoftwarePicker selectedIds={selectedIds} onToggle={onToggle} />
        </div>
      )}
    </Card>
  );
}
