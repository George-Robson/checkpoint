export interface KitOrderFormValues {
  /** New hire's full name (user kits) or new site name (site kits). */
  assignee: string;
  startDate: string;
  shipTo: string;
  notes: string;
}

export type KitOrderFormErrors = Partial<Record<keyof KitOrderFormValues, string>>;
