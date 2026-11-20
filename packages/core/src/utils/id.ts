/** Platform-safe id generation (Hermes has no crypto.randomUUID on older engines). */
export function createId(prefix = ''): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  const uuid =
    g.crypto?.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/** Short correlation id suitable for HTTP headers and log correlation. */
export function createCorrelationId(): string {
  return createId().replace(/-/g, '').slice(0, 20);
}

/** High resolution clock when available. */
export function now(): number {
  const p = (globalThis as { performance?: { now?: () => number } }).performance;
  return p?.now ? p.now() : Date.now();
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Deterministic string hash (FNV-1a) used for percentage rollouts. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
