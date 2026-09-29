import { createClient } from 'npm:@supabase/supabase-js@2.112.4';
import {
  BASE_ORIGINS, CRISIS_REPLIES, DEFAULT_MODEL, MAX_BODY_BYTES, MAX_OUTPUT_TOKENS, TIER_LIMITS,
  buildSystemPrompt, isCacheFresh, isCrisisText, isTier, parseRequest, tierFromSubscriber,
  type ChatMessage, type Locale, type Tier,
} from './logic.ts';

/**
 * ODA cloud coach. Deploy with JWT verification ON (the default):
 *   supabase functions deploy coach-chat
 * Secrets (Supabase dashboard -> Edge Functions -> Secrets, never in the app):
 *   OPENAI_API_KEY, REVENUECAT_SECRET_KEY, optional OPENAI_MODEL, ODA_EXTRA_ORIGINS.
 * Message contents are never logged and never stored; only a monthly counter is.
 */

/** Only ODA itself may call this from a browser (same rule as delete-account). */
const ALLOWED_ORIGINS = new Set([
  ...BASE_ORIGINS,
  ...(Deno.env.get('ODA_EXTRA_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean),
]);

type Admin = ReturnType<typeof createClient>;

// ---------------------------------------------------------------------------
// The provider call. Swap this one function (and its env vars) to change AI vendor.
// ---------------------------------------------------------------------------
async function generateReply(input: { system: string; messages: ChatMessage[]; userRef: string }): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('provider-not-configured');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') || DEFAULT_MODEL,
      messages: [{ role: 'system', content: input.system }, ...input.messages],
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      store: false, // do not keep the completion in OpenAI's stored-completions log
      safety_identifier: input.userRef, // a hash, not the user id or email
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`provider-${response.status}`); // status only, never the body
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('provider-empty');
  return text.trim();
}

// ---------------------------------------------------------------------------
// Tier: RevenueCat REST v1, cached for 10 minutes in ai_tier_cache.
// ---------------------------------------------------------------------------
async function resolveTier(admin: Admin, userId: string): Promise<Tier> {
  const secret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!secret) return 'free'; // RevenueCat not configured: everyone is on the free level

  const { data: cached } = await admin.from('ai_tier_cache').select('tier, checked_at').eq('user_id', userId).maybeSingle();
  if (cached && isTier(cached.tier) && isCacheFresh(cached.checked_at)) return cached.tier;

  try {
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`revenuecat-${response.status}`);
    const tier = tierFromSubscriber(await response.json());
    await admin.from('ai_tier_cache').upsert({ user_id: userId, tier, checked_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return tier;
  } catch {
    // RevenueCat is down: keep serving the last known level rather than downgrading a paying member.
    return cached && isTier(cached.tier) ? cached.tier : 'free';
  }
}

async function usedThisMonth(admin: Admin, userId: string): Promise<number> {
  const month = new Date().toISOString().slice(0, 7);
  const { data } = await admin.from('ai_usage').select('count').eq('user_id', userId).eq('month', month).maybeSingle();
  return typeof data?.count === 'number' ? data.count : 0;
}

async function userReference(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`oda-coach:${userId}`));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

Deno.serve(async request => {
  const origin = request.headers.get('Origin') ?? '';
  const cors: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    ...(ALLOWED_ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  };
  const reply = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });

  if (origin && !ALLOWED_ORIGINS.has(origin)) return new Response('Forbidden', { status: 403, headers: cors });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { ...cors, Allow: 'POST' } });

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !service) return reply({ error: 'The cloud coach is not configured' }, 503);

  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return reply({ error: 'Not signed in' }, 401);
  const asUser = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: who, error: whoError } = await asUser.auth.getUser(token);
  if (whoError || !who.user) return reply({ error: 'Not signed in' }, 401);
  const userId = who.user.id;

  const declared = Number(request.headers.get('Content-Length') ?? 0);
  if (declared > MAX_BODY_BYTES) return reply({ error: 'Request too large' }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return reply({ error: 'Request too large' }, 413);
  let json: unknown;
  try { json = JSON.parse(text); } catch { return reply({ error: 'Invalid request' }, 400); }
  const parsed = parseRequest(json);
  if (!parsed.ok) return reply({ error: parsed.error }, 400);
  const { messages, locale, context } = parsed;

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const tier = await resolveTier(admin, userId);
  const limit = TIER_LIMITS[tier];
  const snapshot = async (extra: Record<string, unknown> = {}) => {
    const used = await usedThisMonth(admin, userId);
    return { remaining: Math.max(0, limit - used), limit, tier, ...extra };
  };

  // Status only: how many messages are left. Costs nothing.
  if (messages.length === 0) return reply(await snapshot());

  // Crisis words in the latest message: answer with a safe fixed message, no model, no count.
  if (isCrisisText(messages[messages.length - 1].content)) {
    return reply(await snapshot({ reply: CRISIS_REPLIES[locale as Locale], crisis: true }));
  }

  if (!Deno.env.get('OPENAI_API_KEY')) return reply({ error: 'The cloud coach is not configured' }, 503);

  // One statement increments and checks the monthly counter, so parallel requests cannot overshoot.
  const { data: claim, error: claimError } = await admin.rpc('ai_increment_usage', { p_user: userId, p_limit: limit });
  const row = Array.isArray(claim) ? claim[0] : claim;
  if (claimError || !row) return reply({ error: 'Could not check the monthly allowance' }, 500);
  if (!row.allowed) return reply({ error: 'quota', remaining: 0, limit, tier }, 429);

  try {
    const answer = await generateReply({
      system: buildSystemPrompt(locale, tier, context),
      messages,
      userRef: await userReference(userId),
    });
    return reply({ reply: answer, remaining: Math.max(0, limit - Number(row.used)), limit, tier });
  } catch (error) {
    // A reply we could not deliver is not charged. Log the reason code only, never any content.
    await admin.rpc('ai_refund_usage', { p_user: userId });
    console.error('coach-chat provider failure:', (error as Error).message);
    return reply({ error: 'The coach could not answer right now' }, 502);
  }
});
