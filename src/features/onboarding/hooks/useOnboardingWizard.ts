import { useMemo, useState } from 'react';
import { HOME_DELIVERY } from '../../../constants/delivery';
import { addDays, formatDate, getNow, toIsoDate } from '../../../lib/date';
import type { Acquisition } from '../../../types/acquisition';
import { useKits } from '../../kits/hooks/useKits';
import { isClientKit, type ClientKit } from '../../kits/utils/isClientKit';
import { kitCost, type KitCost } from '../../kits/utils/kitPricing';
import { useLicences } from '../../licences/hooks/useLicences';
import { useSeatAvailability } from '../../licences/hooks/useSeatAvailability';
import { softwareMonthlyCost } from '../../licences/utils/softwareLookup';
import { useSession } from '../../session/hooks/useSession';
import { useTenant } from '../../tenants/hooks/useTenant';
import { getTenantSites } from '../../tenants/utils/getTenantSites';
import { getTenant } from '../../tenants/utils/tenantLookup';
import { WIZARD_STEPS } from '../constants/wizardSteps';
import { NO_KIT, type OnboardingDraft, type OnboardingDraftErrors, type WizardStep } from '../types/onboardingDraft';
import type { StartOnboardingResult } from '../types/startOnboardingInput';
import { useOnboardings } from './useOnboardings';

/** Default start date: two weeks out, the usual gap between offer and first day. */
const DEFAULT_START_IN_DAYS = 14;

function defaultShipTo(tenantId: string): string {
  return tenantId ? (getTenantSites(tenantId)[0] ?? HOME_DELIVERY) : '';
}

function defaultAcquisition(tenantId: string): Acquisition {
  return (tenantId && getTenant(tenantId)?.hardwarePreference) || 'lease';
}

const NO_HARDWARE_COST: KitCost = { upfront: 0, monthly: 0 };

function validate(draft: OnboardingDraft, step: WizardStep, earliestStart: string): OnboardingDraftErrors {
  const errors: OnboardingDraftErrors = {};
  if (step === 'person') {
    if (!draft.tenantId) errors.tenantId = 'Choose the client they are joining.';
    if (draft.person.trim().length < 2) errors.person = "Enter the new hire's full name.";
    if (!draft.startDate || draft.startDate < earliestStart) {
      errors.startDate = `Choose ${formatDate(earliestStart)} or later.`;
    }
  }
  if (step === 'hardware') {
    if (!draft.kitId) errors.kitId = 'Choose a kit, or "No hardware".';
    if (draft.kitId && draft.kitId !== NO_KIT && !draft.shipTo) errors.shipTo = 'Choose where to deliver the kit.';
  }
  return errors;
}

export function useOnboardingWizard() {
  const { selectedTenant } = useTenant();
  const { currentUser } = useSession();
  const { kits } = useKits();
  const { startOnboarding } = useOnboardings();

  const earliestStart = toIsoDate(addDays(getNow(), 1));
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const tenantId = currentUser.tenantId ?? selectedTenant?.id ?? '';
    return {
      tenantId,
      person: '',
      jobTitle: '',
      startDate: toIsoDate(addDays(getNow(), DEFAULT_START_IN_DAYS)),
      kitId: '',
      shipTo: defaultShipTo(tenantId),
      acquisition: defaultAcquisition(tenantId),
      softwareIds: [],
    };
  });
  const [step, setStep] = useState<WizardStep>('person');
  const [attempted, setAttempted] = useState<Set<WizardStep>>(new Set());

  const tenant = draft.tenantId ? getTenant(draft.tenantId) : null;
  const { baselines } = useLicences();
  const baselineIds = useMemo(() => baselines[draft.tenantId] ?? [], [baselines, draft.tenantId]);
  const availability = useSeatAvailability(draft.tenantId || null);

  const tenantKits = useMemo(
    () =>
      kits
        .filter(isClientKit)
        .filter((kit) => kit.ownerTenantId === draft.tenantId && kit.assignmentTarget === 'user'),
    [kits, draft.tenantId],
  );
  const selectedKit: ClientKit | null = tenantKits.find((kit) => kit.id === draft.kitId) ?? null;

  /** Everything that will be licensed: baseline plus the picks. */
  const softwareIds = useMemo(
    () => [...new Set([...baselineIds, ...draft.softwareIds])],
    [baselineIds, draft.softwareIds],
  );

  const kitDelivery = selectedKit ? toIsoDate(addDays(getNow(), selectedKit.leadTimeDays)) : null;
  const deliveryWarning =
    selectedKit && kitDelivery && kitDelivery >= draft.startDate
      ? `${selectedKit.name} ships in ${selectedKit.leadTimeDays} days, so it arrives ${formatDate(kitDelivery)}, on or after their start date.`
      : null;

  const seatsToBuy = softwareIds.filter((id) => (availability.get(id)?.free ?? 0) === 0);
  const hardwareCost = selectedKit ? kitCost(selectedKit.lines, draft.acquisition) : NO_HARDWARE_COST;
  const softwareMonthly = softwareMonthlyCost(softwareIds);

  const errors = attempted.has(step) ? validate(draft, step, earliestStart) : {};
  const stepIndex = WIZARD_STEPS.findIndex((candidate) => candidate.id === step);

  function setField<K extends 'person' | 'jobTitle' | 'startDate' | 'shipTo' | 'acquisition'>(field: K, value: OnboardingDraft[K]) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  /** A different client has different kits, sites and baseline, so the later steps reset. */
  function setTenant(tenantId: string) {
    setDraft((previous) => ({
      ...previous,
      tenantId,
      kitId: '',
      shipTo: defaultShipTo(tenantId),
      acquisition: defaultAcquisition(tenantId),
      softwareIds: [],
    }));
  }

  /** Swaps the previous kit's recommendations for the new kit's, keeping anything picked by hand. */
  function selectKit(kitId: string) {
    setDraft((previous) => {
      const previousKit = tenantKits.find((kit) => kit.id === previous.kitId);
      const nextKit = tenantKits.find((kit) => kit.id === kitId);
      const handPicked = previous.softwareIds.filter((id) => !previousKit?.recommendedSoftwareIds.includes(id));
      return {
        ...previous,
        kitId,
        softwareIds: [...new Set([...handPicked, ...(nextKit?.recommendedSoftwareIds ?? [])])],
      };
    });
  }

  function toggleSoftware(softwareId: string, included: boolean) {
    toggleSoftwareMany([softwareId], included);
  }

  /** Adds or removes several licences at once (e.g. a bundle). The baseline always stays. */
  function toggleSoftwareMany(softwareIds: string[], included: boolean) {
    setDraft((previous) => ({
      ...previous,
      softwareIds: included
        ? [...new Set([...previous.softwareIds, ...softwareIds])]
        : previous.softwareIds.filter((id) => !softwareIds.includes(id)),
    }));
  }

  /** Moves to the next step when the current one is valid; returns false to let the page focus the error. */
  function next(): boolean {
    setAttempted((previous) => new Set(previous).add(step));
    if (Object.keys(validate(draft, step, earliestStart)).length > 0) return false;
    setStep(WIZARD_STEPS[Math.min(stepIndex + 1, WIZARD_STEPS.length - 1)].id);
    return true;
  }

  function back() {
    setStep(WIZARD_STEPS[Math.max(stepIndex - 1, 0)].id);
  }

  /** Only steps already reached can be revisited from the stepper or review. */
  function goTo(target: WizardStep) {
    if (WIZARD_STEPS.findIndex((candidate) => candidate.id === target) <= stepIndex) setStep(target);
  }

  function submit(): StartOnboardingResult {
    return startOnboarding({
      tenantId: draft.tenantId,
      person: draft.person.trim(),
      jobTitle: draft.jobTitle.trim(),
      startDate: draft.startDate,
      kit: selectedKit,
      shipTo: selectedKit ? draft.shipTo : '',
      acquisition: draft.acquisition,
      softwareIds,
      requestedBy: currentUser.name,
    });
  }

  return {
    draft,
    step,
    stepIndex,
    errors,
    tenant,
    tenantKits,
    selectedKit,
    baselineIds,
    softwareIds,
    availability,
    seatsToBuy,
    kitDelivery,
    deliveryWarning,
    hardwareCost,
    softwareMonthly,
    earliestStart,
    sites: draft.tenantId ? getTenantSites(draft.tenantId) : [],
    setField,
    setTenant,
    selectKit,
    toggleSoftware,
    toggleSoftwareMany,
    next,
    back,
    goTo,
    submit,
  };
}

export type OnboardingWizard = ReturnType<typeof useOnboardingWizard>;
