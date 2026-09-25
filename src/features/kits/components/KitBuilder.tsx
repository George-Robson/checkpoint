import type { FormEvent } from 'react';
import { ArrowLeft, CopyPlus, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { newKitPath, paths } from '../../../app/paths';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { buttonClasses } from '../../../components/ui/buttonStyles';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useSession } from '../../session/hooks/useSession';
import { getTenantName } from '../../tenants/utils/tenantLookup';
import { useKitBuilder } from '../hooks/useKitBuilder';
import { useKits } from '../hooks/useKits';
import type { KitDraft } from '../types/kitDraft';
import { KitCard } from './KitCard';
import { KitDetailsCard } from './KitDetailsCard';
import { KitLinesCard } from './KitLinesCard';
import { KitPriceSummary } from './KitPriceSummary';
import { KitRecommendedSoftwareCard } from './KitRecommendedSoftwareCard';

interface KitBuilderProps {
  initialDraft: KitDraft;
  /** Set when editing an existing kit; omitted for a new one. */
  kitId?: string;
  readOnly: boolean;
}

export function KitBuilder({ initialDraft, kitId, readOnly }: KitBuilderProps) {
  const navigate = useNavigate();
  const { currentUser } = useSession();
  const { kits } = useKits();
  const { draft, setField, addLine, setQuantity, removeLine, toggleRecommendedSoftware, linesOfKind, errors, save } =
    useKitBuilder(
    initialDraft,
    kitId,
  );

  const isTemplate = draft.ownerTenantId === null;
  const sourceTemplate = draft.sourceTemplateId ? kits.find((kit) => kit.id === draft.sourceTemplateId) : undefined;
  const backTo = isTemplate ? `${paths.kits}?tab=templates` : paths.kits;

  const scope = isTemplate ? 'Checkpoint template · available to every client' : getTenantName(draft.ownerTenantId ?? '');
  const origin = isTemplate ? null : sourceTemplate ? `Based on the ${sourceTemplate.name} template` : 'Built from scratch';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const saved = save();
    if (saved) {
      navigate(backTo, { state: { savedKitId: saved.id } });
    } else {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Kits
      </Link>

      <PageHeader
        title={kitId ? draft.name || 'Untitled kit' : 'New kit'}
        description={[scope, origin].filter(Boolean).join(' · ')}
        actions={
          readOnly ? (
            <>
              <Badge tone="slate">
                <Eye aria-hidden="true" className="size-3" />
                View only
              </Badge>
              {isTemplate && kitId && currentUser.tenantId && (
                <Link to={newKitPath(currentUser.tenantId, kitId)} className={buttonClasses('primary', 'md')}>
                  <CopyPlus aria-hidden="true" className="size-4" />
                  Use this template
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to={backTo} className={buttonClasses('secondary', 'md')}>
                Cancel
              </Link>
              <Button type="submit">{kitId ? 'Save changes' : isTemplate ? 'Create template' : 'Create kit'}</Button>
            </>
          )
        }
      />

      {!readOnly && isTemplate && (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          You're editing a template. Clients who already copied it keep their own version; only new copies use these
          changes.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <fieldset disabled={readOnly} className="space-y-6 lg:col-span-2">
          <legend className="sr-only">Kit details and contents</legend>
          <KitDetailsCard draft={draft} errors={errors} setField={setField} />
          <KitLinesCard
            kind="hardware"
            lines={linesOfKind('hardware')}
            error={errors.hardware}
            onAdd={addLine}
            onQuantityChange={setQuantity}
            onRemove={removeLine}
          />
          <KitLinesCard
            kind="peripheral"
            lines={linesOfKind('peripheral')}
            onAdd={addLine}
            onQuantityChange={setQuantity}
            onRemove={removeLine}
          />
          <KitRecommendedSoftwareCard
            selectedIds={draft.recommendedSoftwareIds}
            onToggle={toggleRecommendedSoftware}
            disabled={draft.assignmentTarget === 'site'}
            ownerTenantId={draft.ownerTenantId}
          />
        </fieldset>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <KitPriceSummary
            lines={draft.lines}
            assignmentTarget={draft.assignmentTarget}
            recommendedSoftwareIds={draft.recommendedSoftwareIds}
            sourceTemplate={sourceTemplate}
          />
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">Storefront preview</p>
            <KitCard kit={draft} />
          </div>
        </aside>
      </div>
    </form>
  );
}
