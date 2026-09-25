export type SoftwareCategory =
  | 'productivity'
  | 'ai'
  | 'design'
  | 'development'
  | 'collaboration'
  | 'communications'
  | 'sales'
  | 'security'
  | 'line-of-business';

/** An individually licensable software product, billed per seat per month. */
export interface SoftwareProduct {
  id: string;
  name: string;
  vendor: string;
  detail: string;
  category: SoftwareCategory;
  monthlyPricePerSeat: number;
  /**
   * Logo: a Simple Icons slug (e.g. 'jetbrains'), or a path under /software-logos for brands that
   * Simple Icons doesn't carry. Absent = monogram fallback.
   */
  logo?: string;
}
