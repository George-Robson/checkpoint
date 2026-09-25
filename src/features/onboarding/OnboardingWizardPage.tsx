import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '../../app/paths';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { AccountRestrictedNotice } from '../billing/components/AccountRestrictedNotice';
import { useAccountStanding } from '../billing/hooks/useAccountStanding';
import { HardwareStep } from './components/HardwareStep';
import { OnboardingSummaryPanel } from './components/OnboardingSummaryPanel';
import { PersonStep } from './components/PersonStep';
import { ReviewStep } from './components/ReviewStep';
import { SoftwareStep } from './components/SoftwareStep';
import { WizardStepper } from './components/WizardStepper';
import { useOnboardingWizard } from './hooks/useOnboardingWizard';
import type { OnboardingCreatedState } from './types/onboardingCreatedState';

export function OnboardingWizardPage() {
  const navigate = useNavigate();
  const wizard = useOnboardingWizard();
  const stepRef = useRef<HTMLDivElement>(null);
  const isReview = wizard.step === 'review';
  const standing = useAccountStanding(wizard.draft.tenantId);
  const restricted = standing?.restricted ?? false;

  // Each step starts at the top; the app's main pane is the scroll container.
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [wizard.step]);

  function handleNext() {
    if (!wizard.next()) {
      // Let the errors render, then focus the first invalid control.
      requestAnimationFrame(() => stepRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    }
  }

  function handleSubmit() {
    const result = wizard.submit();
    const state: OnboardingCreatedState = {
      createdId: result.onboarding.id,
      seatsAdded: result.licences.seatsAdded.reduce((sum, entry) => sum + entry.count, 0),
    };
    navigate(paths.onboarding, { state });
  }

  return (
    <div className="space-y-6">
      <Link to={paths.onboarding} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Onboarding
      </Link>

      <PageHeader
        title="Onboard a new hire"
        description="Choose their hardware and software in one go. The kit ships before their first day and licences activate on it."
      />

      {standing && restricted && (
        <AccountRestrictedNotice standing={standing} clientName={wizard.tenant?.name ?? 'this client'} action="New onboardings" />
      )}

      <WizardStepper currentIndex={wizard.stepIndex} onSelect={wizard.goTo} />

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <div ref={stepRef} className="space-y-4 lg:col-span-2">
          {wizard.step === 'person' && <PersonStep wizard={wizard} />}
          {wizard.step === 'hardware' && <HardwareStep wizard={wizard} />}
          {wizard.step === 'software' && <SoftwareStep wizard={wizard} />}
          {isReview && <ReviewStep wizard={wizard} />}

          <div className="flex items-center justify-between gap-4">
            {wizard.stepIndex > 0 ? (
              <Button variant="secondary" onClick={wizard.back}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back
              </Button>
            ) : (
              <Link to={paths.onboarding} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Cancel
              </Link>
            )}
            {isReview ? (
              <Button onClick={handleSubmit} disabled={restricted}>
                Start onboarding
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <OnboardingSummaryPanel wizard={wizard} />
        </aside>
      </div>
    </div>
  );
}
