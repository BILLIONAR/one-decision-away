import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

/**
 * In-app account deletion (App Store Review Guideline 5.1.1(v)).
 * The caller proves who they are with their own session token; the service
 * role then deletes that user. Every ODA table references auth.users with
 * ON DELETE CASCADE, so the cloud backup and push subscriptions go with it.
 * Deploy with JWT verification ON (the default): supabase functions deploy delete-account
 */
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { ...cors, Allow: 'POST' } });

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !service) return Response.json({ error: 'Account deletion is not configured' }, { status: 503, headers: cors });

  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Not signed in' }, { status: 401, headers: cors });

  const asUser = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: who, error: whoError } = await asUser.auth.getUser(token);
  if (whoError || !who.user) return Response.json({ error: 'Not signed in' }, { status: 401, headers: cors });

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.deleteUser(who.user.id);
  if (error) return Response.json({ error: 'Could not delete the account' }, { status: 500, headers: cors });
  return Response.json({ deleted: true }, { headers: cors });
});
