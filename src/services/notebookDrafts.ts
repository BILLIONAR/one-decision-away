/** Unsubmitted text belongs to this tab, separate from the saved notebook backup. */
const PREFIX = 'oda-notebook-draft-v1:';
const memory = new Map<string, unknown>();
const resetListeners = new Set<() => void>();
let resetVersion = 0;

export function readNotebookDraft<T>(key: string): { found: boolean; value?: T } {
  if (memory.has(key)) return { found: true, value: memory.get(key) as T };
  try {
    const saved = window.sessionStorage.getItem(key);
    if (saved !== null) return { found: true, value: JSON.parse(saved) as T };
  } catch { /* Unavailable storage falls back to the current saved record. */ }
  return { found: false };
}

export function writeNotebookDraft<T>(key: string, value: T): void {
  memory.set(key, value);
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Memory still survives route changes. */ }
}

/** Call only after a successful intentional reset or backup replacement. */
export function clearNotebookDrafts(): void {
  memory.clear();
  try {
    for (let i = window.sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) window.sessionStorage.removeItem(key);
    }
  } catch { /* The in-memory cache is cleared even if browser storage is blocked. */ }
  resetVersion += 1;
  resetListeners.forEach(listener => listener());
}

export function subscribeNotebookDraftReset(listener: () => void): () => void {
  resetListeners.add(listener);
  return () => resetListeners.delete(listener);
}

export function getNotebookDraftResetVersion(): number { return resetVersion; }
