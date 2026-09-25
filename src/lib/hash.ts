/** Stable 32-bit FNV-1a hash, for deterministic mock data (the same input always gives the same number). */
export function stableHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** A deterministic number in [0, 1) for the input. */
export function stableUnit(input: string): number {
  return stableHash(input) / 0x100000000;
}
