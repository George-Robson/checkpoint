import type { Invoice } from '../../../types/invoice';

export interface Suspension {
  since: string;
  by: string;
}

/** Decisions made by Checkpoint's accounts team; everything else in credit control follows from the dates. */
export interface CreditControlState {
  /** Tenant id → active suspension. */
  suspensions: Record<string, Suspension>;
  /** Overdue invoices whose hold was released, e.g. because a payment plan was agreed. */
  releasedHoldInvoiceIds: string[];
}

export type AccountStage = 'good-standing' | 'overdue' | 'on-hold' | 'final-notice' | 'suspended';

export interface AccountStanding {
  tenantId: string;
  stage: AccountStage;
  /** Unpaid invoices past their due date, oldest first. */
  overdue: Invoice[];
  overdueAmount: number;
  oldestDaysOverdue: number;
  /** An overdue invoice would have put the account on hold, but the hold was released. */
  holdReleased: boolean;
  /** New orders and onboarding are blocked. */
  restricted: boolean;
  /** The final notice period has run out, so services may be suspended (by a person, never automatically). */
  canSuspend: boolean;
  /** When suspension becomes possible, once a final notice has gone out. */
  suspendableFrom: string | null;
  suspension: Suspension | null;
}
