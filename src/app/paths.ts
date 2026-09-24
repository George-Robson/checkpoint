export const paths = {
  dashboard: '/',
  fleet: '/fleet',
  onboarding: '/onboarding',
  newOnboarding: '/onboarding/new',
  storefront: '/storefront',
  offboarding: '/offboarding',
  software: '/software',
  kits: '/kits',
  newKit: '/kits/new',
} as const;

export function kitPath(kitId: string): string {
  return `${paths.kits}/${kitId}`;
}

/** Owner is a tenant id, or 'library' for a Checkpoint template. `from` copies an existing kit. */
export function newKitPath(owner: string, from?: string): string {
  const params = new URLSearchParams({ owner });
  if (from) params.set('from', from);
  return `${paths.newKit}?${params}`;
}
