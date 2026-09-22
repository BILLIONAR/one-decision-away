import { createClient } from 'npm:@supabase/supabase-js@2.112.4';
import { ApplicationServer, importVapidKeys, PushMessageError, Urgency } from 'jsr:@negrel/webpush@0.5.0';
import quotes from './quotes.json' with { type: 'json' };
import { isAllowedPushEndpoint, matchesSecret, payloadForNudge, type DueNudge, type PushQuote } from './core.ts';

// Deploy with --no-verify-jwt: this endpoint accepts the private cron secret only.
// The browser never receives service-role credentials or VAPID private keys.
Deno.serve(async request => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  const cronSecret = Deno.env.get('PUSH_CRON_SECRET') ?? '';
  if (!await matchesSecret(request.headers.get('x-oda-cron-secret') ?? '', cronSecret)) return new Response('Unauthorized', { status: 401 });

  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const keysJson = Deno.env.get('VAPID_KEYS_JSON');
  const contact = Deno.env.get('VAPID_SUBJECT');
  const siteUrl = Deno.env.get('PUSH_SITE_URL');
  if (!url || !key || !keysJson || !contact?.startsWith('mailto:') || !siteUrl || quotes.length !== 600) {
    return Response.json({ error: 'Push backend setup is incomplete' }, { status: 503 });
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  let sender: ApplicationServer;
  try {
    sender = await ApplicationServer.new({ contactInformation: contact, vapidKeys: await importVapidKeys(JSON.parse(keysJson), { extractable: false }) });
    // Validate snapshot and deployment URL before claiming anything.
    payloadForNudge({ locale: 'tr', local_date: '2026-01-01', slot: 'morning', slot_index: 0 } as DueNudge, quotes as PushQuote[], siteUrl);
  } catch {
    return Response.json({ error: 'Push keys, quote snapshot or deployment configuration is invalid' }, { status: 503 });
  }

  const { data, error } = await db.rpc('oda_claim_due_nudges', { batch_limit: 100 });
  if (error) return Response.json({ error: 'Notification schedule could not be claimed' }, { status: 503 });
  const jobs = (data ?? []) as DueNudge[];
  const counts = { claimed: jobs.length, sent: 0, failed: 0, expired: 0 };
  let next = 0;
  const sendNext = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      let status: 'sent' | 'failed' | 'expired' = 'failed';
      try {
        if (!isAllowedPushEndpoint(job.endpoint)) throw new Error('Unsupported push endpoint');
        const payload = payloadForNudge(job, quotes as PushQuote[], siteUrl);
        const subscriber = sender.subscribe({ endpoint: job.endpoint, keys: { p256dh: job.p256dh, auth: job.auth } });
        // Expire stale inspiration after one hour rather than delivering a backlog.
        // Topic also lets the push provider replace an older queued message per slot.
        await subscriber.pushTextMessage(JSON.stringify(payload), { ttl: 3600, urgency: Urgency.Normal, topic: `oda-${job.slot}` });
        status = 'sent';
      } catch (error) {
        if (error instanceof PushMessageError && [404, 410].includes(error.response.status)) status = 'expired';
        // Do not log endpoint URLs, message bodies or member identifiers.
      }
      counts[status] += 1;
      if (status === 'expired') {
        await db.from('oda_push_subscriptions').delete().eq('id', job.subscription_id);
      } else {
        await db.from('oda_push_deliveries').update({ status, completed_at: new Date().toISOString() })
          .eq('subscription_id', job.subscription_id).eq('local_date', job.local_date).eq('slot', job.slot);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, jobs.length) }, sendNext));
  // Retain seven days of audit/idempotency data, without unbounded free-tier growth.
  await db.rpc('oda_prune_push_deliveries');
  return Response.json(counts);
});
