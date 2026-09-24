import { PackageX } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { paths } from '../../app/paths';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSession } from '../session/hooks/useSession';
import { canEditKit, canViewKit } from '../session/utils/permissions';
import { KitBuilder } from './components/KitBuilder';
import { useKits } from './hooks/useKits';
import { blankDraft, copyDraft, resolveDraftOwner, toDraft } from './utils/draftFactory';

/** Routes: /kits/:kitId (edit or view) and /kits/new?owner=…&from=… (create, optionally copying). */
export function KitBuilderPage() {
  const { kitId } = useParams();
  const [searchParams] = useSearchParams();
  const { kits } = useKits();
  const { currentUser } = useSession();

  if (kitId) {
    const kit = kits.find((candidate) => candidate.id === kitId);
    if (!kit || !canViewKit(currentUser, kit)) {
      return (
        <Card>
          <EmptyState
            icon={PackageX}
            title="Kit not found"
            description="It may belong to another organisation, or the link is out of date."
            action={
              <Link to={paths.kits} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Back to kits
              </Link>
            }
          />
        </Card>
      );
    }
    return (
      <KitBuilder
        // Remount when switching account so read-only state and the draft reset.
        key={`${kit.id}:${currentUser.id}`}
        initialDraft={toDraft(kit)}
        kitId={kit.id}
        readOnly={!canEditKit(currentUser, kit)}
      />
    );
  }

  const owner = resolveDraftOwner(searchParams.get('owner'), currentUser);
  const source = kits.find((candidate) => candidate.id === searchParams.get('from'));
  const initialDraft = source && canViewKit(currentUser, source) ? copyDraft(source, owner) : blankDraft(owner);

  return <KitBuilder key={`${searchParams}:${currentUser.id}`} initialDraft={initialDraft} readOnly={false} />;
}
