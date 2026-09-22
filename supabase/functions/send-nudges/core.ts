export type PushQuote = { id: string; text: string; tr: string; source: string; sourceTr: string; kind: 'translation' | 'adaptation' };
export type DueNudge = {
  subscription_id: string; endpoint: string; p256dh: string; auth: string;
  locale: 'tr' | 'en'; local_date: string; slot: string; slot_index: number; due_at: string;
};

export function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return endpoint.length <= 2048 && url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash
      && (['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(url.hostname)
        || /^[a-z0-9-]+\.notify\.windows\.com$/.test(url.hostname));
  } catch { return false; }
}

/** Match the frontend's local calendar-day cycle without using the server's zone. */
export function scheduledQuoteIndex(localDate: string, slotIndex: number, count: number): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 5 || count < 6) {
    throw new Error('Invalid scheduled quote inputs');
  }
  const midnight = Date.parse(`${localDate}T00:00:00Z`);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== localDate) throw new Error('Invalid local date');
  const day = Math.floor(midnight / 86_400_000);
  return ((day * 6 + slotIndex) % count + count) % count;
}

const TR_TITLES = ['Sabahın sözü', 'Yeni bir adım', 'Günün ortasında', 'İkindinin ilhamı', 'Akşamın sözü', 'Günü huzurla kapat'];
const EN_TITLES = ['A morning thought', 'One new step', 'A midday pause', 'Afternoon inspiration', 'An evening thought', 'Close the day gently'];

export function payloadForNudge(nudge: DueNudge, quotes: readonly PushQuote[], siteUrl: string) {
  if (quotes.length !== 600 || new Set(quotes.map(quote => quote.id)).size !== 600) throw new Error('The 600-quote server snapshot is missing or invalid');
  const quote = quotes[scheduledQuoteIndex(nudge.local_date, nudge.slot_index, quotes.length)];
  const tr = nudge.locale === 'tr';
  const source = tr ? quote.sourceTr : quote.source;
  const annotation = quote.kind === 'adaptation' ? (tr ? ' · yorumlama' : ' · adaptation') : (tr ? ' · çeviri' : ' · translation');
  const body = `${tr ? quote.tr : quote.text}\n— ${source}${annotation}`;
  const url = new URL(siteUrl);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('PUSH_SITE_URL must use HTTPS');
  if (url.pathname === '/') url.pathname = '/app';
  else url.hash = '/app';
  const payload = {
    title: `ODA · ${(tr ? TR_TITLES : EN_TITLES)[nudge.slot_index]}`,
    body, tag: `oda-nudge-${nudge.slot}`, url: url.href,
    quoteId: quote.id, date: nudge.local_date,
  };
  if (new TextEncoder().encode(JSON.stringify(payload)).length > 3500) throw new Error('Push payload exceeds the safe encrypted message size');
  return payload;
}

export async function matchesSecret(received: string, expected: string): Promise<boolean> {
  if (expected.length < 32 || received.length > 256) return false;
  const encode = (value: string) => new TextEncoder().encode(value);
  const [left, right] = await Promise.all([received, expected].map(value => crypto.subtle.digest('SHA-256', encode(value))));
  const a = new Uint8Array(left); const b = new Uint8Array(right);
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a[i] ^ b[i];
  return difference === 0;
}
