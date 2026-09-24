import type { KitLine } from '../../../types/kit';
import { kitUnitsByKind } from './kitPricing';

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** e.g. "1 device · 3 accessories" */
export function describeContents(lines: KitLine[]): string {
  const units = kitUnitsByKind(lines);
  return [
    plural(units.hardware, 'device'),
    plural(units.peripheral, 'accessory', 'accessories'),
  ].join(' · ');
}
