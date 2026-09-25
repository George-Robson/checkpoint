import type { DeviceType } from './device';

/** Physical items only; software is licensed separately (see SoftwareProduct). */
export type CatalogItemKind = 'hardware' | 'peripheral';

export interface CatalogSpec {
  label: string;
  value: string;
}

/** Something a kit can contain, priced both to lease and to buy outright. */
export interface CatalogItem {
  id: string;
  kind: CatalogItemKind;
  name: string;
  /** Short descriptor, e.g. '16" mobile workstation'. */
  detail: string;
  vendor: string;
  /** Managed hardware only: the fleet device type it becomes once deployed. */
  deviceType?: DeviceType;
  /** Hardware spec sheet, most important first (the first three form the summary line). */
  specs?: CatalogSpec[];
  /** Product image URL. Falls back to the kind icon when absent. */
  image?: string;
  /** Monthly lease price, including support, warranty and returns. */
  monthlyPrice: number;
  /** One-off price to buy outright (ex. VAT). */
  purchasePrice: number;
}
