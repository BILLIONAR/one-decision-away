import type { Locale } from '../i18n';

/** Sentence-case an interface label, keeping punctuation and the rest of its text intact.
 * This is presentation only: never use it when saving or editing user content.
 */
export function sentenceCaseLabel(text: string, locale: Locale): string {
  const start = /^([\s\p{P}\p{S}]*)(\p{Ll})([\p{L}\p{M}\p{N}]*)/u.exec(text);
  if (!start) return text;
  // Preserve intentionally mixed-case names such as iPhone and eBay.
  if (/\p{Lu}/u.test(start[3])) return text;
  return start[1] + start[2].toLocaleUpperCase(locale) + text.slice(start[1].length + start[2].length);
}
