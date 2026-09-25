import { MOCK_NOW } from '../../../data/mockData';
import { addDays, toIsoDate } from '../../../lib/date';
import { useInvoices } from '../../billing/hooks/useInvoices';
import { formatPeriod } from '../../billing/utils/billingPeriod';
import { useDevices } from '../../devices/hooks/useDevices';
import { useKits } from '../../kits/hooks/useKits';
import { useLicences } from '../../licences/hooks/useLicences';
import { useOffboarding } from '../../offboarding/hooks/useOffboarding';
import { useOnboardings } from '../../onboarding/hooks/useOnboardings';
import { useOrders } from '../../orders/hooks/useOrders';
import type { TimeTravelSummary } from '../types/timeTravelSummary';
import { createDeliveredDevices } from '../utils/createDeliveredDevices';
import { useClock } from './useClock';

const DEFAULT_LEAD_TIME_DAYS = 3;

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Moves the demo clock forward and applies everything that falls due, in dependency order:
 * orders progress → delivered hardware joins the fleet → new hires start → offboardings progress →
 * licences activate or are released → monthly invoices are issued from the result.
 */
export function useTimeTravel() {
  const { offsetDays, setOffsetDays, setSummary } = useClock();
  const { kits } = useKits();
  const orders = useOrders();
  const devices = useDevices();
  const onboardings = useOnboardings();
  const offboarding = useOffboarding();
  const licences = useLicences();
  const invoices = useInvoices();

  function advance(days: number) {
    const nextOffset = offsetDays + days;
    const now = addDays(new Date(MOCK_NOW), nextOffset);
    const today = toIsoDate(now);

    const orderResult = orders.advanceTo(
      today,
      (kitId) => kits.find((kit) => kit.id === kitId)?.leadTimeDays ?? DEFAULT_LEAD_TIME_DAYS,
    );
    const delivered = createDeliveredDevices(orderResult.delivered, kits, devices.devices, today, now.toISOString());
    devices.updateDevices(delivered.activated);
    devices.addDevices(delivered.created);
    const deviceCount = delivered.created.length + Object.keys(delivered.activated).length;
    const started = onboardings.advanceTo(today, new Set(orderResult.approved.map((order) => order.id)));
    const offboardingResult = offboarding.advanceTo(today);
    const licenceResult = licences.advanceTo(today);
    const fleetAfterDelivery = [
      ...devices.devices.map((device) => ({ ...device, ...delivered.activated[device.id] })),
      ...delivered.created,
    ];
    const issued = invoices.issueDue(today, { devices: fleetAfterDelivery, pools: licences.pools, orders: orders.orders, kits });
    const issuedPeriods = [...new Set(issued.map((invoice) => formatPeriod(invoice.period)))];
    const withLateCharges = issued.filter((invoice) => invoice.lines.some((line) => line.kind === 'late-payment')).length;

    const events = [
      orderResult.approved.length && `${plural(orderResult.approved.length, 'order')} approved`,
      orderResult.shipped.length && `${plural(orderResult.shipped.length, 'order')} shipped`,
      orderResult.delivered.length &&
        `${plural(orderResult.delivered.length, 'order')} delivered: ${plural(deviceCount, 'device')} now active in the fleet`,
      started.length && `${plural(started.length, 'new hire')} started: ${started.map((o) => o.person).join(', ')}`,
      licenceResult.activated && `${plural(licenceResult.activated, 'licence')} activated`,
      offboardingResult.started.length &&
        `${plural(offboardingResult.started.length, 'offboarding')} started: ${offboardingResult.started.map((r) => r.employee).join(', ')}`,
      offboardingResult.completed.length &&
        `${plural(offboardingResult.completed.length, 'offboarding')} completed${offboardingResult.devicesReturned ? `, ${plural(offboardingResult.devicesReturned, 'device')} returned` : ''}`,
      licenceResult.released && `${plural(licenceResult.released, 'licence')} released back to their pools`,
      issued.length &&
        `${plural(issued.length, 'invoice')} issued for ${issuedPeriods.join(', ')}${withLateCharges ? ` (${withLateCharges} with late payment charges)` : ''}`,
    ].filter((event): event is string => Boolean(event));

    setOffsetDays(nextOffset);
    const summary: TimeTravelSummary = { today, events };
    setSummary(summary);
  }

  /** Stores are in memory only, so a reload is the reliable way back to the seeded state. */
  function reset() {
    window.location.reload();
  }

  return { offsetDays, advance, reset };
}
