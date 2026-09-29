/**
 * Cloud coach client. Talks only to our own Supabase edge function
 * (supabase/functions/coach-chat) with the signed-in session; the AI provider
 * key lives on the server and never reaches the app. Pure parts (request
 * building, error mapping) are exported for tests/cloud-coach.test.ts.
 */
import type { UserData } from '../types/models';
import { cloudSync } from './cloudSync';
import { t } from '../i18n';

export type CloudTier = 'free' | 'essentials' | 'pro' | 'coach';
export type CloudLocale = 'en' | 'tr' | 'es';
export type CloudChatMessage = { role: 'user' | 'assistant'; content: string };
export type CloudCoachContext = { todayDecision?: string; recentKept?: string[]; journalSnippets?: string[] };

/** Must match supabase/functions/coach-chat/logic.ts (a test checks it). */
export const CLOUD_MAX_MESSAGES = 12;
export const CLOUD_MAX_MESSAGE_CHARS = 1500;

export type CloudCoachResult = { reply?: string; remaining: number; limit: number; tier: CloudTier; crisis?: boolean };
export type CloudCoachErrorKind = 'not-signed-in' | 'quota' | 'offline' | 'server' | 'unavailable';
export class CloudCoachError extends Error {
  constructor(public kind: CloudCoachErrorKind, message: string, public info?: { limit: number; tier: CloudTier }) {
    super(message);
    this.name = 'CloudCoachError';
  }
}

const TIERS: CloudTier[] = ['free', 'essentials', 'pro', 'coach'];

export function buildRequestBody(messages: CloudChatMessage[], locale: string, context?: CloudCoachContext | null) {
  const trimmed = messages
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, CLOUD_MAX_MESSAGE_CHARS) }))
    .filter(m => m.content)
    .slice(-CLOUD_MAX_MESSAGES);
  const body: { messages: CloudChatMessage[]; locale: CloudLocale; context?: CloudCoachContext } = {
    messages: trimmed,
    locale: locale === 'tr' || locale === 'es' ? locale : 'en',
  };
  if (context) {
    const clean: CloudCoachContext = {
      todayDecision: context.todayDecision?.trim().slice(0, 200) || undefined,
      recentKept: context.recentKept?.map(s => s.trim().slice(0, 160)).filter(Boolean).slice(0, 5),
      journalSnippets: context.journalSnippets?.map(s => s.trim().slice(0, 300)).filter(Boolean).slice(0, 3),
    };
    if (clean.todayDecision || clean.recentKept?.length || clean.journalSnippets?.length) body.context = clean;
  }
  return body;
}

/** Turns an HTTP status and JSON body into a typed result or error. */
export function interpretResponse(status: number, payload: unknown): CloudCoachResult {
  const body = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const tier = TIERS.includes(body.tier as CloudTier) ? (body.tier as CloudTier) : 'free';
  const limit = typeof body.limit === 'number' ? body.limit : 0;
  if (status >= 200 && status < 300 && typeof body.remaining === 'number' && typeof body.limit === 'number') {
    return { reply: typeof body.reply === 'string' ? body.reply : undefined, remaining: body.remaining, limit, tier, crisis: body.crisis === true };
  }
  if (status === 401) throw new CloudCoachError('not-signed-in', t('Please sign in again to use the cloud coach.'));
  if (status === 429) throw new CloudCoachError('quota', t('You have used this month’s coach messages.'), { limit, tier });
  if (status === 404 || status === 503) throw new CloudCoachError('unavailable', t('The cloud coach is not available right now.'));
  throw new CloudCoachError('server', t('The cloud coach could not answer just now. This message was not counted. Please try again in a moment.'));
}

const dayKey = () => new Date().toISOString().slice(0, 10);

/** Only what the member agreed to share, and only as short plain lines. */
export function buildCoachContext(data: UserData | null | undefined, tr: (s: string) => string = s => s): CloudCoachContext {
  if (!data) return {};
  const today = dayKey();
  const decisions = data.missions.filter(m => m.isOneDecision);
  const current = decisions.find(m => m.scheduledFor === today || m.status === 'active');
  const kept = decisions
    .filter(m => m.status === 'completed' && m.completedAt)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 5)
    .map(m => tr(m.title));
  const journal = (data.notebook?.entries ?? [])
    .filter(e => e.kind === 'journal' && e.content.trim())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
    .map(e => e.content.trim().replace(/\s+/g, ' ').slice(0, 300));
  return { todayDecision: current ? tr(current.title) : undefined, recentKept: kept, journalSnippets: journal };
}

// ---------------------------------------------------------------------------
// Consent to share context (coach level only). Local to this device, off by default.
// ---------------------------------------------------------------------------
const CONSENT_KEY = 'oda_coach_share_context';
export function readContextConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === '1'; } catch { return false; }
}
export function writeContextConsent(on: boolean): void {
  try { if (on) localStorage.setItem(CONSENT_KEY, '1'); else localStorage.removeItem(CONSENT_KEY); } catch { /* not saved */ }
}

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------
export function isCloudCoachConfigured(): boolean {
  return cloudSync.isConfigured();
}

async function call(body: ReturnType<typeof buildRequestBody>, signal?: AbortSignal): Promise<CloudCoachResult> {
  const config = cloudSync.getConfig();
  const session = cloudSync.getState().session;
  if (!config) throw new CloudCoachError('unavailable', t('The cloud coach is not available right now.'));
  if (!session) throw new CloudCoachError('not-signed-in', t('Please sign in again to use the cloud coach.'));
  // Stop button and a 45 s timeout share one signal (AbortSignal.any is missing on older iPhones).
  const link = new AbortController();
  const timer = setTimeout(() => link.abort(), 45_000);
  const onAbort = () => link.abort();
  signal?.addEventListener('abort', onAbort);
  if (signal?.aborted) link.abort();
  let response: Response;
  try {
    response = await fetch(`${config.url.replace(/\/$/, '')}/functions/v1/coach-chat`, {
      method: 'POST',
      headers: { apikey: config.anonKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: link.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError' && signal?.aborted) throw error;
    throw new CloudCoachError('offline', t('You seem to be offline. The tools above still work without a connection.'));
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
  let payload: unknown = null;
  try { payload = await response.json(); } catch { /* not JSON */ }
  return interpretResponse(response.status, payload);
}

/** Sends the conversation and returns the reply with what is left this month. */
export function sendToCloudCoach(messages: CloudChatMessage[], locale: string, context?: CloudCoachContext | null, signal?: AbortSignal) {
  return call(buildRequestBody(messages, locale, context), signal);
}

/** Asks only how many messages are left (costs nothing). */
export function getCloudCoachStatus(locale: string, signal?: AbortSignal) {
  return call(buildRequestBody([], locale), signal);
}
