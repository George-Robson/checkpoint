/** What happened when the demo clock moved forward, for the confirmation toast. */
export interface TimeTravelSummary {
  /** The new "today" (YYYY-MM-DD). */
  today: string;
  events: string[];
}
