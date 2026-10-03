/** Compare exact remote JSON without treating PostgreSQL object-key order as a change. */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) as string;
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

/** Freeze JSON serialization semantics and compare object keys without reordering arrays. */
export function canonicalDocumentJson(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error('Invalid cloud document');
  return canonicalJson(JSON.parse(json));
}

/** A missing digest capability pauses backup; there is no weaker fallback. */
export async function remoteDocumentFingerprint(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalDocumentJson(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function isRemoteVersion(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

/** Advance even with a regressed clock or a PostgreSQL microsecond timestamp. */
export function nextRemoteVersion(previous?: string): string {
  if (previous !== undefined && !isRemoteVersion(previous)) throw new Error('Invalid cloud version');
  const stamp = new Date(Math.max(Date.now(), previous === undefined ? 0 : Date.parse(previous) + 1)).toISOString();
  if (!isRemoteVersion(stamp)) throw new Error('Invalid cloud version');
  return stamp;
}
