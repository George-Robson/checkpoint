/** "Lucy Morgan" + "initech.io" → "lucy.morgan@initech.io" (null until there's a usable name). */
export function suggestWorkEmail(fullName: string, domain: string): string | null {
  const parts = fullName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s'-]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return null;
  const local = parts.length === 1 ? parts[0] : `${parts[0]}.${parts[parts.length - 1]}`;
  return `${local.replace(/'/g, '')}@${domain}`;
}
