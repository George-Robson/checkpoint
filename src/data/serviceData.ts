/**
 * Managed-service mock data: support tickets (from the PSA), device health (from the RMM / Intune), backups
 * and security posture. Kept apart from mockData.ts, which describes what clients have rather than how it's
 * running. Dates are relative to MOCK_NOW (24 Sept 2026, 13:00 UTC).
 */
import type { BackupJob } from '../types/backup';
import type { DeviceHealth } from '../types/deviceHealth';
import type { SecurityPosture } from '../types/securityPosture';
import type { Ticket, TicketCategory } from '../types/ticket';

/** Checkpoint's service desk engineers. */
export const ENGINEERS = ['Owen Price', 'Aisha Khan', 'Sophie Turner', 'Liam Carter'];

// ---------------------------------------------------------------------------
// Device health
// ---------------------------------------------------------------------------

/** The EDR agent each client runs on computers and servers. */
export const TENANT_EDR_PRODUCT: Record<string, string> = {
  't-acme': 'Defender for Business',
  't-globex': 'CrowdStrike Falcon',
  't-initech': 'Defender for Business',
  't-umbrella': 'Defender for Endpoint',
  't-northwind': 'Microsoft Defender',
  't-forgewright': 'CrowdStrike Falcon',
  't-lanternfly': 'Microsoft Defender',
};

/** Hand-set health for devices with a story; every other device is derived (see features/health). */
export const DEVICE_HEALTH_OVERRIDES: Record<string, Partial<DeviceHealth>> = {
  // Server down since 03:17 (alert a-001): patching failed on its last run.
  'd-009': { patch: { status: 'failed', missing: 6, lastPatchedOn: '2026-08-14', kind: 'os' } },
  // Hasn't checked in for 5 days (alert a-003), so it's behind on updates.
  'd-036': { patch: { status: 'overdue', missing: 14, lastPatchedOn: '2026-08-12', kind: 'os' }, edr: 'outdated' },
  // Workstation missing BitLocker after a motherboard swap.
  'd-027': { encryption: 'not-encrypted' },
  // Northwind's older laptop is low on disk and a cumulative update is waiting on a reboot.
  'd-044': { patch: { status: 'pending', missing: 2, lastPatchedOn: '2026-09-10', kind: 'os' }, diskFreePercent: 7 },
  // Firmware update available (alert a-007).
  'd-033': { patch: { status: 'pending', missing: 1, lastPatchedOn: '2026-06-18', kind: 'firmware' } },
  // Umbrella's server: agent a version behind.
  'd-040': { edr: 'outdated' },
  // Forgewright's Perforce NAS runs Synology DSM (no EDR agent) and is filling up (alert a-008).
  'd-057': { osVersion: 'Synology DSM 7.2', edr: 'not-applicable', edrProduct: null, diskFreePercent: 9 },
  // Lanternfly's NAS, and a MacBook that was never set up with FileVault.
  'd-069': { osVersion: 'Synology DSM 7.2', edr: 'not-applicable', edrProduct: null, diskFreePercent: 41 },
  'd-068': { encryption: 'not-encrypted' },
};

// ---------------------------------------------------------------------------
// Security posture
// ---------------------------------------------------------------------------

export const securityPostures: SecurityPosture[] = [
  {
    tenantId: 't-acme', mfaEnrolled: 236, mfaTotal: 240, usersWithoutMfa: ['Megan Doyle', 'Warehouse Kiosk 2', 'Warehouse Kiosk 3', 'Reception'],
    secureScore: 71, cyberEssentials: { level: 'cyber-essentials-plus', expiresOn: '2027-03-18' }, dmarc: 'reject', phishingClickRate: 0.06,
  },
  {
    tenantId: 't-globex', mfaEnrolled: 410, mfaTotal: 410, usersWithoutMfa: [],
    secureScore: 84, cyberEssentials: { level: 'cyber-essentials-plus', expiresOn: '2027-01-09' }, dmarc: 'reject', phishingClickRate: 0.03,
  },
  {
    tenantId: 't-initech', mfaEnrolled: 81, mfaTotal: 85, usersWithoutMfa: ['Lucy Morgan', 'Build Agent', 'Design Shared', 'Studio iPad'],
    secureScore: 63, cyberEssentials: { level: 'cyber-essentials', expiresOn: '2026-10-21' }, dmarc: 'quarantine', phishingClickRate: 0.11,
  },
  {
    tenantId: 't-umbrella', mfaEnrolled: 117, mfaTotal: 120, usersWithoutMfa: ['Locum GP 1', 'Locum GP 2', 'Marcus Reid'],
    secureScore: 68, cyberEssentials: { level: 'cyber-essentials-plus', expiresOn: '2027-05-02' }, dmarc: 'reject', phishingClickRate: 0.08,
  },
  {
    tenantId: 't-northwind', mfaEnrolled: 44, mfaTotal: 60, usersWithoutMfa: ['Depot Tablet 1', 'Depot Tablet 2', 'Driver Pool'],
    secureScore: 52, cyberEssentials: null, dmarc: 'none', phishingClickRate: null,
  },
  {
    tenantId: 't-forgewright', mfaEnrolled: 55, mfaTotal: 55, usersWithoutMfa: [],
    secureScore: 79, cyberEssentials: { level: 'cyber-essentials-plus', expiresOn: '2027-02-14' }, dmarc: 'reject', phishingClickRate: 0.04,
    studio: {
      devkitNetworkIsolated: true,
      buildAccessReviewedOn: '2026-08-29',
      buildWatermarking: true,
      lastPublisherAudit: { on: '2026-05-12', result: 'passed-with-actions' },
      nextPublisherAudit: '2026-11-16',
    },
  },
  {
    tenantId: 't-lanternfly', mfaEnrolled: 6, mfaTotal: 7, usersWithoutMfa: ['Leo Barnes'],
    secureScore: null, cyberEssentials: null, dmarc: 'quarantine', phishingClickRate: null,
    studio: {
      // Their first devkit arrived with the publishing deal and is on the office Wi-Fi.
      devkitNetworkIsolated: false,
      buildAccessReviewedOn: null,
      buildWatermarking: false,
      lastPublisherAudit: null,
      nextPublisherAudit: '2026-12-01',
    },
  },
];

// ---------------------------------------------------------------------------
// Backups
// ---------------------------------------------------------------------------

export const backupJobs: BackupJob[] = [
  {
    id: 'bk-acme-m365', tenantId: 't-acme', name: 'Microsoft 365', kind: 'microsoft-365',
    scope: '240 mailboxes · OneDrive · SharePoint · Teams', deviceId: null, schedule: '3× daily', retentionDays: 2555, protectedGb: 1840,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-acme-srv01', tenantId: 't-acme', name: 'ACME-SRV-01', kind: 'server',
    scope: 'Image backup · file shares', deviceId: 'd-008', schedule: 'Hourly, 07:00–19:00', retentionDays: 90, protectedGb: 2210,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-acme-srv02', tenantId: 't-acme', name: 'ACME-SRV-02', kind: 'server',
    scope: 'Image backup · file shares', deviceId: 'd-009', schedule: 'Hourly, 07:00–19:00', retentionDays: 90, protectedGb: 1630,
    recent: { status: 'failed', runs: 1, message: 'Host unreachable since 03:17. Last good backup 23 Sept, 19:00.' },
  },
  {
    id: 'bk-acme-sql', tenantId: 't-acme', name: 'ACME-VM-SQL01', kind: 'cloud-server',
    scope: 'Azure Backup · SQL point-in-time', deviceId: 'd-010', schedule: 'Daily 01:00 + log every 15 min', retentionDays: 35, protectedGb: 420,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-globex-m365', tenantId: 't-globex', name: 'Microsoft 365', kind: 'microsoft-365',
    scope: '410 mailboxes · OneDrive · SharePoint · Teams', deviceId: null, schedule: '3× daily', retentionDays: 2555, protectedGb: 5120,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-globex-srv', tenantId: 't-globex', name: 'GLX-SRV-01', kind: 'server',
    scope: 'Image backup · immutable copy offsite', deviceId: 'd-022', schedule: 'Hourly', retentionDays: 365, protectedGb: 3900,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-globex-app', tenantId: 't-globex', name: 'GLX-VM-APP02', kind: 'cloud-server',
    scope: 'AWS Backup · EBS snapshots', deviceId: 'd-023', schedule: 'Daily 02:00', retentionDays: 35, protectedGb: 310,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-initech-m365', tenantId: 't-initech', name: 'Microsoft 365', kind: 'microsoft-365',
    scope: '85 mailboxes · OneDrive · SharePoint', deviceId: null, schedule: '3× daily', retentionDays: 1095, protectedGb: 690,
    recent: { status: 'warning', runs: 2, message: '3 OneDrive items skipped: file path longer than 400 characters.' },
  },
  {
    id: 'bk-initech-ci', tenantId: 't-initech', name: 'INT-VM-CI01', kind: 'cloud-server',
    scope: 'Azure Backup · build cache excluded', deviceId: 'd-032', schedule: 'Daily 01:30', retentionDays: 14, protectedGb: 260,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-umbrella-m365', tenantId: 't-umbrella', name: 'Microsoft 365', kind: 'microsoft-365',
    scope: '120 mailboxes · OneDrive · SharePoint', deviceId: null, schedule: '3× daily', retentionDays: 2555, protectedGb: 980,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-umbrella-srv', tenantId: 't-umbrella', name: 'UMB-SRV-01', kind: 'server',
    scope: 'Image backup · encrypted offsite copy', deviceId: 'd-040', schedule: 'Every 4 hours', retentionDays: 180, protectedGb: 1450,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-northwind-m365', tenantId: 't-northwind', name: 'Microsoft 365', kind: 'microsoft-365',
    scope: '60 mailboxes · OneDrive', deviceId: null, schedule: 'Daily 23:00', retentionDays: 365, protectedGb: 210,
    recent: { status: 'failed', runs: 3, message: 'Authentication expired: the backup app needs re-consenting in Entra ID.' },
  },
  {
    id: 'bk-forgewright-m365', tenantId: 't-forgewright', name: 'Microsoft 365', kind: 'microsoft-365',
    scope: '55 mailboxes · OneDrive · SharePoint · Teams', deviceId: null, schedule: '3× daily', retentionDays: 1095, protectedGb: 640,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-forgewright-p4', tenantId: 't-forgewright', name: 'FWG-SRV-01', kind: 'server',
    scope: 'Perforce checkpoints + journals · depot snapshots · offsite replica', deviceId: 'd-057', schedule: 'Hourly', retentionDays: 90, protectedGb: 31400,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-lanternfly-workspace', tenantId: 't-lanternfly', name: 'Google Workspace', kind: 'google-workspace',
    scope: '7 accounts · Gmail · Drive · Shared drives', deviceId: null, schedule: 'Daily 23:00', retentionDays: 365, protectedGb: 180,
    recent: { status: 'success', runs: 30, message: null },
  },
  {
    id: 'bk-lanternfly-nas', tenantId: 't-lanternfly', name: 'LFG-SRV-01', kind: 'server',
    scope: 'Perforce depot · art source files · offsite copy', deviceId: 'd-069', schedule: 'Nightly 02:00', retentionDays: 60, protectedGb: 1980,
    recent: { status: 'failed', runs: 2, message: 'Offsite copy failed: the storage bucket’s 2 TB quota is full. Local snapshots are fine.' },
  },
];

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

/** Open and recent tickets with a story. Older, resolved history is generated (see features/helpdesk). */
export const currentTickets: Ticket[] = [
  {
    id: 'tkt-4829', reference: 'TKT-4829', psaId: 'PSA-48293', tenantId: 't-lanternfly',
    subject: 'Unity Pro licence won’t activate on build machine', category: 'software', priority: 'p3', status: 'new', source: 'portal',
    description: 'Unity Hub says the seat is already in use, but nobody else is signed in on that machine. Blocking tonight’s Steam build.',
    requester: 'Tom Ashworth', assignee: null, deviceId: 'd-065', alertId: null,
    createdAt: '2026-09-24T11:05:00Z', firstResponseAt: null, resolvedAt: null,
    updates: [],
  },
  {
    id: 'tkt-4828', reference: 'TKT-4828', psaId: 'PSA-48290', tenantId: 't-forgewright',
    subject: 'Perforce depot volume 91% full', category: 'hardware', priority: 'p2', status: 'open', source: 'monitoring',
    description: 'Raised automatically: FWG-SRV-01 depot volume has 3.4 TB free.',
    requester: 'Monitoring', assignee: 'Owen Price', deviceId: 'd-057', alertId: 'a-008',
    createdAt: '2026-09-24T07:31:00Z', firstResponseAt: '2026-09-24T08:05:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Owen Price', authorRole: 'engineer', at: '2026-09-24T08:05:00Z', body: 'Archiving old nightly builds from //builds frees about 2 TB today. Four more drives are ordered; I’ll expand the volume Thursday evening, outside crunch hours.' },
    ],
  },
  {
    id: 'tkt-4827', reference: 'TKT-4827', psaId: 'PSA-48283', tenantId: 't-forgewright',
    subject: 'Perforce and VPN access for new contractor', category: 'access', priority: 'p3', status: 'waiting', source: 'portal',
    description: 'We have a contract lighting artist starting Monday on the codename project. Needs VPN, Perforce and Slack.',
    requester: 'Dan Whitaker', assignee: 'Aisha Khan', deviceId: null, alertId: null,
    createdAt: '2026-09-23T14:00:00Z', firstResponseAt: '2026-09-23T14:40:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Aisha Khan', authorRole: 'engineer', at: '2026-09-23T14:40:00Z', body: 'Accounts are ready with the Contractor starter bundle. The publisher needs the signed NDA on file before I open the codename stream in Perforce. Could you forward it?' },
    ],
  },
  {
    id: 'tkt-4826', reference: 'TKT-4826', psaId: 'PSA-48279', tenantId: 't-lanternfly',
    subject: 'Isolated network for our first devkit', category: 'network', priority: 'p3', status: 'open', source: 'email',
    description: 'Our publisher is sending a second devkit next month. They mentioned their audit will check how devkits are connected.',
    requester: 'Tom Ashworth', assignee: 'Liam Carter', deviceId: 'd-070', alertId: null,
    createdAt: '2026-09-22T09:30:00Z', firstResponseAt: '2026-09-22T11:10:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Liam Carter', authorRole: 'engineer', at: '2026-09-22T11:10:00Z', body: 'Right now the devkit is on the office Wi-Fi. I’ll set up a separate devkit VLAN on the MX68 with its own wired port and no route to office devices; no new hardware needed. Booking it in for Friday.' },
    ],
  },
  {
    id: 'tkt-4825', reference: 'TKT-4825', psaId: 'PSA-48291', tenantId: 't-northwind',
    subject: 'Scanner app not syncing on NWL-MOB-0131', category: 'software', priority: 'p4', status: 'new', source: 'phone',
    description: 'Jamie says the Descartes app shows yesterday’s manifest and won’t refresh. Other drivers are fine.',
    requester: 'Jamie Stewart', assignee: null, deviceId: 'd-046', alertId: null,
    createdAt: '2026-09-24T12:10:00Z', firstResponseAt: null, resolvedAt: null,
    updates: [],
  },
  {
    id: 'tkt-4824', reference: 'TKT-4824', psaId: 'PSA-48288', tenantId: 't-globex',
    subject: 'Suspicious email reported by Amara Nwosu', category: 'security', priority: 'p2', status: 'open', source: 'portal',
    description: 'Amara received an invoice email from a lookalike domain asking to change bank details. She didn’t click anything.',
    requester: 'James Holloway', assignee: 'Liam Carter', deviceId: null, alertId: null,
    createdAt: '2026-09-24T11:40:00Z', firstResponseAt: '2026-09-24T11:52:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Liam Carter', authorRole: 'engineer', at: '2026-09-24T11:52:00Z', body: 'Thanks James. I’ve pulled the message from all mailboxes and blocked the sender domain. Checking whether anyone else received it.' },
    ],
  },
  {
    id: 'tkt-4823', reference: 'TKT-4823', psaId: 'PSA-48285', tenantId: 't-acme',
    subject: 'AutoCAD crashes opening large DWG files', category: 'software', priority: 'p3', status: 'new', source: 'portal',
    description: 'Since yesterday’s update, AutoCAD closes without an error when I open the warehouse layout drawings (over 200 MB).',
    requester: 'Priya Raman', assignee: null, deviceId: 'd-003', alertId: null,
    createdAt: '2026-09-24T09:12:00Z', firstResponseAt: null, resolvedAt: null,
    updates: [],
  },
  {
    id: 'tkt-4822', reference: 'TKT-4822', psaId: 'PSA-48280', tenantId: 't-northwind',
    subject: 'Core switch unreachable at Glasgow Depot', category: 'network', priority: 'p1', status: 'open', source: 'monitoring',
    description: 'Raised automatically: NWL-SW-01 stopped responding at 06:47. 14 downstream clients affected.',
    requester: 'Monitoring', assignee: 'Aisha Khan', deviceId: 'd-047', alertId: 'a-002',
    createdAt: '2026-09-24T06:48:00Z', firstResponseAt: '2026-09-24T07:05:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Aisha Khan', authorRole: 'engineer', at: '2026-09-24T07:05:00Z', body: 'Called Callum. The switch has no power lights after a power cut overnight. Replacement MS120 is on a courier from stock, ETA 14:00.' },
      { id: 'u2', author: 'Callum Fraser', authorRole: 'client', at: '2026-09-24T08:20:00Z', body: 'Thanks. Drivers are using 4G on the handhelds for now.' },
    ],
  },
  {
    id: 'tkt-4821', reference: 'TKT-4821', psaId: 'PSA-48276', tenantId: 't-acme',
    subject: 'ACME-SRV-02 offline: file shares unavailable', category: 'hardware', priority: 'p1', status: 'open', source: 'monitoring',
    description: 'Raised automatically: ACME-SRV-02 has missed heartbeats since 03:17 UTC.',
    requester: 'Monitoring', assignee: 'Owen Price', deviceId: 'd-009', alertId: 'a-001',
    createdAt: '2026-09-24T03:32:00Z', firstResponseAt: '2026-09-24T03:41:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Owen Price', authorRole: 'engineer', at: '2026-09-24T03:41:00Z', body: 'Investigating. iDRAC reports a failed power supply. Shares are being failed over to ACME-SRV-01.' },
      { id: 'u2', author: 'Owen Price', authorRole: 'engineer', at: '2026-09-24T06:15:00Z', body: 'Failover complete: shares are available again from SRV-01. Dell are sending a replacement PSU next business day.' },
    ],
  },
  {
    id: 'tkt-4820', reference: 'TKT-4820', psaId: 'PSA-48262', tenantId: 't-initech',
    subject: 'GitHub SSO failing for new developer', category: 'access', priority: 'p2', status: 'open', source: 'portal',
    description: 'Lucy Morgan starts on Monday and can’t get into the GitHub organisation: SAML error after signing in.',
    requester: 'Hannah Clarke', assignee: 'Sophie Turner', deviceId: null, alertId: null,
    createdAt: '2026-09-23T16:20:00Z', firstResponseAt: '2026-09-23T16:48:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Sophie Turner', authorRole: 'engineer', at: '2026-09-23T16:48:00Z', body: 'Looking now. Her Entra account isn’t in the GitHub enterprise app’s assigned group yet.' },
      { id: 'u2', author: 'Sophie Turner', authorRole: 'engineer', at: '2026-09-24T09:30:00Z', body: 'Group fixed; waiting for GitHub’s provisioning sync, which is currently delayed on their side.' },
    ],
  },
  {
    id: 'tkt-4819', reference: 'TKT-4819', psaId: 'PSA-48240', tenantId: 't-umbrella',
    subject: 'Laptop not connecting at Bath Clinic', category: 'network', priority: 'p3', status: 'waiting', source: 'email',
    description: 'Marcus’s laptop won’t join the clinic Wi-Fi, so he can’t get to EMIS.',
    requester: 'Nadia Hussain', assignee: 'Sophie Turner', deviceId: 'd-036', alertId: null,
    createdAt: '2026-09-22T10:05:00Z', firstResponseAt: '2026-09-22T10:40:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Sophie Turner', authorRole: 'engineer', at: '2026-09-22T10:40:00Z', body: 'The laptop hasn’t checked in for days, so its Wi-Fi certificate has likely expired. It needs to be on a wired connection once to renew.' },
      { id: 'u2', author: 'Sophie Turner', authorRole: 'engineer', at: '2026-09-23T15:10:00Z', body: 'Could Marcus plug in at the clinic office on Thursday? I’ll renew it remotely while he’s connected.' },
    ],
  },
  {
    id: 'tkt-4818', reference: 'TKT-4818', psaId: 'PSA-48233', tenantId: 't-acme',
    subject: 'Shared mailbox for sales@', category: 'request', priority: 'p4', status: 'resolved', source: 'portal',
    description: 'Please create sales@acmecorp.co.uk as a shared mailbox for the sales team, with Sarah and Daniel as members.',
    requester: 'Sarah Whitfield', assignee: 'Liam Carter', deviceId: null, alertId: null,
    createdAt: '2026-09-22T09:00:00Z', firstResponseAt: '2026-09-22T09:35:00Z', resolvedAt: '2026-09-23T11:20:00Z',
    updates: [
      { id: 'u1', author: 'Liam Carter', authorRole: 'engineer', at: '2026-09-23T11:20:00Z', body: 'Created sales@ with Sarah and Daniel as members; it’ll appear in Outlook within the hour.' },
    ],
  },
  {
    id: 'tkt-4817', reference: 'TKT-4817', psaId: 'PSA-48221', tenantId: 't-globex',
    subject: 'Second monitor for Amara’s desk', category: 'request', priority: 'p4', status: 'waiting', source: 'portal',
    description: 'Amara would like a second screen. Same model as the rest of the floor if possible.',
    requester: 'James Holloway', assignee: 'Aisha Khan', deviceId: null, alertId: null,
    createdAt: '2026-09-21T11:00:00Z', firstResponseAt: '2026-09-21T12:30:00Z', resolvedAt: null,
    updates: [
      { id: 'u1', author: 'Aisha Khan', authorRole: 'engineer', at: '2026-09-21T12:30:00Z', body: 'Quote sent for a Dell U2724DE (£459 to buy, or £9/mo on lease). Let us know which you’d prefer.' },
    ],
  },
  {
    id: 'tkt-4816', reference: 'TKT-4816', psaId: 'PSA-48198', tenantId: 't-initech',
    subject: 'VPN drops for remote developers every afternoon', category: 'network', priority: 'p3', status: 'resolved', source: 'portal',
    description: 'Ravi and Grace lose the VPN at about 15:00 each day when working from home.',
    requester: 'Hannah Clarke', assignee: 'Owen Price', deviceId: null, alertId: null,
    createdAt: '2026-09-20T14:00:00Z', firstResponseAt: '2026-09-20T15:10:00Z', resolvedAt: '2026-09-22T09:30:00Z',
    updates: [
      { id: 'u1', author: 'Owen Price', authorRole: 'engineer', at: '2026-09-22T09:30:00Z', body: 'The VPN IP pool was running out when the build agents reconnected. Enlarged the pool on INT-FW-01.' },
    ],
  },
];

/** Typical requests by category, for generating realistic ticket history. */
export const TICKET_TEMPLATES: Record<TicketCategory, { subject: string; resolution: string }[]> = {
  hardware: [
    { subject: 'Laptop battery draining quickly', resolution: 'Battery health at 61%; replaced under warranty.' },
    { subject: 'Docking station not detecting monitors', resolution: 'Updated dock firmware and display drivers.' },
    { subject: 'Desk phone stuck on boot screen', resolution: 'Factory reset and re-provisioned the handset.' },
    { subject: 'Cracked screen on company phone', resolution: 'Swapped for a spare from stock; damaged unit sent for repair.' },
  ],
  software: [
    { subject: 'Outlook keeps asking for password', resolution: 'Cleared cached credentials and repaired the Office install.' },
    { subject: 'Teams calls dropping audio', resolution: 'Updated the headset firmware and Teams client.' },
    { subject: 'Excel crashing with large workbook', resolution: 'Disabled a faulty add-in and moved to 64-bit Office.' },
    { subject: 'Need Adobe Acrobat installed', resolution: 'Assigned licence and deployed via Intune.' },
  ],
  access: [
    { subject: 'Locked out after password change', resolution: 'Unlocked account and re-registered MFA.' },
    { subject: 'Access to finance SharePoint site', resolution: 'Added to the Finance Members group after manager approval.' },
    { subject: 'New phone: move authenticator app', resolution: 'Reset MFA methods and re-enrolled on the new phone.' },
  ],
  network: [
    { subject: 'Slow Wi-Fi in meeting room', resolution: 'Moved the access point to a clearer channel.' },
    { subject: 'Printer not reachable from laptops', resolution: 'Printer had changed IP; set a DHCP reservation.' },
    { subject: 'Guest Wi-Fi password for visitors', resolution: 'Sent the weekly guest code and updated the lobby sign.' },
  ],
  security: [
    { subject: 'Phishing email reported', resolution: 'Purged from all mailboxes and blocked the sender.' },
    { subject: 'Defender alert on downloaded file', resolution: 'File quarantined; full scan clean.' },
    { subject: 'Lost phone', resolution: 'Device remote-wiped and removed from Intune.' },
  ],
  request: [
    { subject: 'Distribution list for new team', resolution: 'Created the list and added members.' },
    { subject: 'Temporary laptop for contractor', resolution: 'Issued a spare laptop with a 30-day account.' },
    { subject: 'Change of name after marriage', resolution: 'Updated display name, email alias and signature.' },
  ],
};
