export type SoftwareCategory =
  | 'productivity'
  | 'security'
  | 'development'
  | 'sales'
  | 'communications'
  | 'line-of-business';

/** A licensable software product or managed profile, billed per seat per month. */
export interface SoftwareProduct {
  id: string;
  name: string;
  vendor: string;
  detail: string;
  category: SoftwareCategory;
  monthlyPricePerSeat: number;
}
