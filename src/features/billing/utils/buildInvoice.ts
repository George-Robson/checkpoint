import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { catalogItems, DEVICE_MANAGEMENT_FEE, LEASE_TERM_MONTHS } from '../../../data/mockData';
import { addDays, parseDate, toIsoDate } from '../../../lib/date';
import type { Device } from '../../../types/device';
import type { Invoice, InvoiceLine, InvoiceLineKind } from '../../../types/invoice';
import type { Tenant } from '../../../types/tenant';
import { kitPurchasePrice } from '../../kits/utils/kitPricing';
import { getSoftwareProduct } from '../../licences/utils/softwareLookup';
import { LEGACY_MONTHLY_PRICE, PAYMENT_TERMS_DAYS } from '../constants/billing';
import { INVOICE_LINE_KIND_ORDER } from '../constants/invoiceLineKindMeta';
import type { BillingSources } from '../types/billingSources';
import { periodEnd, periodOf, periodStart, shiftPeriod } from './billingPeriod';

const LINE_DETAIL: Partial<Record<InvoiceLineKind, string>> = {
  'hardware-lease': `${LEASE_TERM_MONTHS}-month lease · management, support and warranty included`,
  cloud: 'Hosting, backup and management',
  'device-management': 'Owned device · monitoring, patching and warranty claims',
};

function deviceMonthlyPrice(device: Device): number {
  return catalogItems.find((item) => item.name === device.model)?.monthlyPrice ?? LEGACY_MONTHLY_PRICE[device.type];
}

/** One line per model, e.g. "Lenovo ThinkPad X1 Carbon Gen 12 × 3". */
function groupByModel(devices: Device[], kind: InvoiceLineKind, unitPrice: (device: Device) => number): InvoiceLine[] {
  const lines = new Map<string, InvoiceLine>();
  for (const device of devices) {
    const existing = lines.get(device.model);
    if (existing) {
      existing.quantity += 1;
    } else {
      lines.set(device.model, {
        kind,
        description: device.model,
        detail: LINE_DETAIL[kind] ?? DEVICE_TYPE_META[device.type].label,
        quantity: 1,
        unitPrice: unitPrice(device),
      });
    }
  }
  return [...lines.values()];
}

export function invoiceNumber(tenant: Tenant, period: string): string {
  return `INV-${tenant.shortCode}-${period.replace('-', '')}`;
}

/**
 * Bills one client for one month: leases, cloud servers, management of owned devices and software seats
 * for the month (in advance), plus hardware bought outright during the previous month. Late-payment charges
 * on earlier invoices are added separately (see applyLateCharges).
 */
export function buildInvoice(tenant: Tenant, period: string, sources: BillingSources): Invoice {
  const start = periodStart(period);
  const end = periodEnd(period);
  const inService = sources.devices.filter(
    (device) => device.tenantId === tenant.id && device.termStartDate <= end && device.termEndDate >= start,
  );
  const leased = inService.filter((device) => device.acquisition === 'lease');
  const owned = inService.filter((device) => device.acquisition === 'purchase');

  const software = sources.pools.flatMap((pool): InvoiceLine[] => {
    const product = getSoftwareProduct(pool.softwareId);
    if (pool.tenantId !== tenant.id || !product || product.monthlyPricePerSeat === 0) return [];
    return [
      {
        kind: 'software',
        description: product.name,
        detail: `${product.vendor} · per seat`,
        quantity: pool.seats,
        unitPrice: product.monthlyPricePerSeat,
      },
    ];
  });

  const previousPeriod = shiftPeriod(period, -1);
  const purchases = sources.orders.flatMap((order): InvoiceLine[] => {
    const kit = sources.kits.find((candidate) => candidate.id === order.kitId);
    if (order.tenantId !== tenant.id || order.acquisition !== 'purchase' || !kit) return [];
    if (periodOf(order.createdAt) !== previousPeriod) return [];
    return [
      {
        kind: 'hardware-purchase',
        description: kit.name,
        detail: `Order ${order.reference} · ${order.assignee}`,
        quantity: 1,
        unitPrice: kitPurchasePrice(kit.lines),
      },
    ];
  });

  const lines = [
    ...groupByModel(
      leased.filter((device) => device.type !== 'virtual-instance'),
      'hardware-lease',
      deviceMonthlyPrice,
    ),
    ...groupByModel(
      leased.filter((device) => device.type === 'virtual-instance'),
      'cloud',
      deviceMonthlyPrice,
    ),
    ...groupByModel(owned, 'device-management', () => DEVICE_MANAGEMENT_FEE),
    ...software,
    ...purchases,
  ].sort(
    (a, b) =>
      INVOICE_LINE_KIND_ORDER.indexOf(a.kind) - INVOICE_LINE_KIND_ORDER.indexOf(b.kind) ||
      a.description.localeCompare(b.description),
  );

  return {
    id: `inv-${tenant.id}-${period}`,
    number: invoiceNumber(tenant, period),
    tenantId: tenant.id,
    period,
    issuedOn: start,
    dueOn: toIsoDate(addDays(parseDate(start), PAYMENT_TERMS_DAYS)),
    lines,
    paidOn: null,
    interestBilledThrough: null,
    compensationBilled: false,
    lateChargesWaived: false,
  };
}
