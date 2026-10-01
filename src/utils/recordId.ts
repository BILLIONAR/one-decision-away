let sequence = 0;

/** Clock ticks identify time, not records; concurrent records need independent IDs. */
export function createRecordId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  const random = globalThis.crypto?.getRandomValues
    ? [...globalThis.crypto.getRandomValues(new Uint32Array(4))].map(value => value.toString(16).padStart(8, '0')).join('')
    : Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}-${random}`;
}
