/** "Globex Solutions" → "GS", "Initech" → "IN", "Dr. Emily Shaw" → "DS" */
export function initialsFor(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}
