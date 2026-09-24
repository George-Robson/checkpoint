import { Check } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { WIZARD_STEPS } from '../constants/wizardSteps';
import type { WizardStep } from '../types/onboardingDraft';

interface WizardStepperProps {
  currentIndex: number;
  onSelect: (step: WizardStep) => void;
}

/** Numbered progress for the onboarding wizard; completed steps can be revisited. */
export function WizardStepper({ currentIndex, onSelect }: WizardStepperProps) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {WIZARD_STEPS.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              disabled={state === 'upcoming'}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                state === 'current' && 'border-indigo-600 bg-white ring-1 ring-indigo-600',
                state === 'done' && 'border-slate-200 bg-white hover:bg-slate-50',
                state === 'upcoming' && 'cursor-default border-slate-200 bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium',
                  state === 'current' && 'bg-indigo-600 text-white',
                  state === 'done' && 'bg-indigo-50 text-indigo-600',
                  state === 'upcoming' && 'bg-slate-100 text-slate-500',
                )}
              >
                {state === 'done' ? <Check aria-hidden="true" className="size-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className={cn('block text-sm font-medium', state === 'upcoming' ? 'text-slate-500' : 'text-slate-900')}>
                  {step.label}
                </span>
                <span className="block truncate text-xs text-slate-500">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
