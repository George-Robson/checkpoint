import type { AccountAction } from '../../../types/offboarding';

interface AccountActionMeta {
  label: string;
  description: string;
  /** Always applied; shown so the reviewer knows it happens. */
  required?: boolean;
  /** Needs a line manager to hand data to. */
  needsLineManager?: boolean;
}

export const ACCOUNT_ACTION_ORDER: AccountAction[] = [
  'block-sign-in',
  'convert-mailbox',
  'transfer-files',
  'remove-licences',
];

export const ACCOUNT_ACTION_META: Record<AccountAction, AccountActionMeta> = {
  'block-sign-in': {
    label: 'Block sign-in and revoke active sessions',
    description: 'Entra ID account disabled and MFA methods removed.',
    required: true,
  },
  'convert-mailbox': {
    label: 'Convert mailbox to shared',
    description: 'Line manager gets access; incoming mail keeps arriving.',
    needsLineManager: true,
  },
  'transfer-files': {
    label: 'Transfer OneDrive files',
    description: 'Files are moved to the line manager before the account is removed.',
    needsLineManager: true,
  },
  'remove-licences': {
    label: 'Release software licences after 30 days',
    description: 'Seats return to the client’s pools 30 days after the last day; data stays recoverable until then.',
  },
};
