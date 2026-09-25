import { LEASE_TERM_MONTHS, DEVICE_MANAGEMENT_FEE } from '../../../data/mockData';
import type { Acquisition } from '../../../types/acquisition';
import type { CatalogItem, CatalogItemKind } from '../../../types/catalog';
import type { KitLine } from '../../../types/kit';
import { getCatalogItem } from './catalogLookup';

export interface ResolvedKitLine {
  item: CatalogItem;
  quantity: number;
  /** Monthly cost of this line (unit price × quantity). */
  total: number;
}

/** Joins kit lines to the catalogue, dropping any that reference unknown items. */
export function resolveKitLines(lines: KitLine[]): ResolvedKitLine[] {
  return lines.flatMap((line) => {
    const item = getCatalogItem(line.catalogItemId);
    return item ? [{ item, quantity: line.quantity, total: item.monthlyPrice * line.quantity }] : [];
  });
}

export function kitMonthlyPrice(lines: KitLine[]): number {
  return resolveKitLines(lines).reduce((sum, line) => sum + line.total, 0);
}

export function kitPriceByKind(lines: KitLine[]): Record<CatalogItemKind, number> {
  const totals: Record<CatalogItemKind, number> = { hardware: 0, peripheral: 0 };
  for (const line of resolveKitLines(lines)) totals[line.item.kind] += line.total;
  return totals;
}

export function kitPurchasePrice(lines: KitLine[]): number {
  return resolveKitLines(lines).reduce((sum, line) => sum + line.item.purchasePrice * line.quantity, 0);
}

/** Devices Checkpoint manages (peripherals aren't managed, so carry no fee). */
export function kitManagedDeviceCount(lines: KitLine[]): number {
  return resolveKitLines(lines).reduce((sum, line) => sum + (line.item.deviceType ? line.quantity : 0), 0);
}

/** Monthly management for the kit's devices: part of the lease price, or billed on its own when owned. */
export function kitManagementFee(lines: KitLine[]): number {
  return kitManagedDeviceCount(lines) * DEVICE_MANAGEMENT_FEE;
}

/** The lease price split into hardware and the management it includes. */
export function leaseBreakdown(lines: KitLine[]): { hardware: number; management: number } {
  const management = kitManagementFee(lines);
  return { hardware: kitMonthlyPrice(lines) - management, management };
}

export interface KitCost {
  /** Paid once, on order. */
  upfront: number;
  /** Paid every month: the lease, or management of owned devices. */
  monthly: number;
}

/** What a kit costs for the chosen way of paying. */
export function kitCost(lines: KitLine[], acquisition: Acquisition): KitCost {
  return acquisition === 'lease'
    ? { upfront: 0, monthly: kitMonthlyPrice(lines) }
    : { upfront: kitPurchasePrice(lines), monthly: kitManagementFee(lines) };
}

/** Total paid over one lease term, to compare leasing with buying. */
export function costOverTerm(cost: KitCost): number {
  return cost.upfront + cost.monthly * LEASE_TERM_MONTHS;
}

/** Units per kind (a pair of monitors counts as two peripherals). */
export function kitUnitsByKind(lines: KitLine[]): Record<CatalogItemKind, number> {
  const counts: Record<CatalogItemKind, number> = { hardware: 0, peripheral: 0 };
  for (const line of resolveKitLines(lines)) counts[line.item.kind] += line.quantity;
  return counts;
}
