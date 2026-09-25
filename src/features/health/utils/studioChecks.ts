import { daysBetween, formatDate, parseDate } from '../../../lib/date';
import type { SecurityPosture } from '../../../types/securityPosture';

/** Access to builds should be reviewed at least this often (and at the end of every contract). */
const ACCESS_REVIEW_DAYS = 90;

export interface StudioCheck {
  label: string;
  ok: boolean;
  detail: string;
  /** What to do when the check fails, for recommendations. */
  fix: string;
}

/**
 * The publisher-audit controls for a game studio, as pass/fail checks. Shared by the Health & security page
 * and the service report so both say the same thing.
 */
export function studioChecks(posture: SecurityPosture, now: Date): StudioCheck[] {
  const studio = posture.studio;
  if (!studio) return [];
  const reviewAge = studio.buildAccessReviewedOn ? daysBetween(parseDate(studio.buildAccessReviewedOn), now) : null;
  const allMfa = posture.mfaEnrolled === posture.mfaTotal;

  return [
    {
      label: 'Devkits on an isolated network',
      ok: studio.devkitNetworkIsolated,
      detail: studio.devkitNetworkIsolated ? 'Own VLAN, no route to office devices or guests' : 'Devkits share the office network',
      fix: 'Move console devkits onto their own isolated network before the next publisher audit.',
    },
    {
      label: 'Build and depot access reviewed',
      ok: reviewAge !== null && reviewAge <= ACCESS_REVIEW_DAYS,
      detail:
        reviewAge === null
          ? 'Never reviewed'
          : `Last reviewed ${formatDate(studio.buildAccessReviewedOn ?? '')}${reviewAge > ACCESS_REVIEW_DAYS ? ', overdue' : ''}`,
      fix: 'Review who can reach builds and Perforce depots, removing contractors whose projects have ended.',
    },
    {
      label: 'External builds watermarked',
      ok: studio.buildWatermarking,
      detail: studio.buildWatermarking ? 'Each recipient gets a traceable build' : 'Leaked builds can’t be traced to a recipient',
      fix: 'Watermark builds sent outside the studio so a leak can be traced to its source.',
    },
    {
      label: 'MFA for everyone',
      ok: allMfa,
      detail: allMfa ? 'All accounts enrolled' : `${posture.usersWithoutMfa.join(', ')} not enrolled`,
      fix: 'Enrol every account in MFA: publishers treat it as a baseline.',
    },
    {
      label: 'Cyber Essentials',
      ok: posture.cyberEssentials !== null,
      detail: posture.cyberEssentials ? `Certified to ${formatDate(posture.cyberEssentials.expiresOn)}` : 'Not certified',
      fix: 'Get Cyber Essentials certified: it answers many publisher questionnaire items at once.',
    },
  ];
}
