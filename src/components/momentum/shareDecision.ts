import { t } from '../../i18n';

/**
 * Accountability with one trusted person: share today's decision so someone
 * can ask about it tonight. Uses the native share sheet when available,
 * otherwise copies the text. Returns what happened for the caller's toast.
 */
export async function shareDecision(title: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const text = t('Today I decided: “{title}”. Ask me tonight if I did it.', { title });
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ text });
      return 'shared';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
