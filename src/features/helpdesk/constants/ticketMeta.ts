import { Cpu, KeyRound, Network, PackagePlus, ShieldAlert, AppWindow, type LucideIcon } from 'lucide-react';
import type { Tone } from '../../../components/ui/tone';
import type { TicketCategory, TicketPriority, TicketSource, TicketStatus } from '../../../types/ticket';

export const TICKET_PRIORITY_ORDER: TicketPriority[] = ['p1', 'p2', 'p3', 'p4'];

export const TICKET_PRIORITY_META: Record<TicketPriority, { label: string; short: string; tone: Tone; description: string }> = {
  p1: { label: 'P1 · Critical', short: 'P1', tone: 'rose', description: 'Business stopped: a site, server or key system is down.' },
  p2: { label: 'P2 · High', short: 'P2', tone: 'amber', description: 'Several people affected, or one person can’t work.' },
  p3: { label: 'P3 · Normal', short: 'P3', tone: 'indigo', description: 'A problem with a workaround.' },
  p4: { label: 'P4 · Low', short: 'P4', tone: 'slate', description: 'A request or question.' },
};

export const TICKET_STATUS_ORDER: TicketStatus[] = ['new', 'open', 'waiting', 'resolved', 'closed'];

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; tone: Tone }> = {
  new: { label: 'New', tone: 'indigo' },
  open: { label: 'In progress', tone: 'amber' },
  waiting: { label: 'Waiting on client', tone: 'slate' },
  resolved: { label: 'Resolved', tone: 'emerald' },
  closed: { label: 'Closed', tone: 'slate' },
};

export const TICKET_CATEGORY_ORDER: TicketCategory[] = ['hardware', 'software', 'access', 'network', 'security', 'request'];

export const TICKET_CATEGORY_META: Record<TicketCategory, { label: string; icon: LucideIcon }> = {
  hardware: { label: 'Hardware', icon: Cpu },
  software: { label: 'Software', icon: AppWindow },
  access: { label: 'Accounts & access', icon: KeyRound },
  network: { label: 'Network', icon: Network },
  security: { label: 'Security', icon: ShieldAlert },
  request: { label: 'Request', icon: PackagePlus },
};

export const TICKET_SOURCE_LABEL: Record<TicketSource, string> = {
  portal: 'Portal',
  email: 'Email',
  phone: 'Phone',
  monitoring: 'Monitoring alert',
};

/** Tickets that still need work. */
export function isOpenStatus(status: TicketStatus): boolean {
  return status === 'new' || status === 'open' || status === 'waiting';
}
