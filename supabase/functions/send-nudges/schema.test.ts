// Real PostgreSQL (WASM), in-memory only. No Supabase account or network sends.
import { PGlite } from 'npm:@electric-sql/pglite@0.5.8';
import assert from 'node:assert/strict';

const db = new PGlite();
const userA = '00000000-0000-4000-8000-000000000001';
const userB = '00000000-0000-4000-8000-000000000002';
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    insert into auth.users values ('${userA}'), ('${userB}');
  `);
  const sql = await Deno.readTextFile(new URL('../../push-notifications.sql', import.meta.url));
  await db.exec(sql);
  await db.exec(sql); // Applying the documented setup twice is safe.

  const now = new Date();
  const slots = ['morning', 'lateMorning', 'midday', 'afternoon', 'evening', 'night'];
  const times = Object.fromEntries(slots.map((slot, index) => [slot, new Date(now.getTime() - (index + 1) * 60_000).toISOString().slice(11, 16)]));
  const insert = (user = userA, endpoint = 'https://fcm.googleapis.com/fcm/send/test', schedule = times, timezone = 'UTC') => db.query(
    `insert into public.oda_push_subscriptions(user_id,endpoint,p256dh,auth,times,timezone)
      values($1,$2,$3,$4,$5::jsonb,$6) returning id`,
    [user, endpoint, 'A'.repeat(87), 'A'.repeat(22), JSON.stringify(schedule), timezone],
  );
  const created = await insert();
  const id = (created.rows[0] as { id: string }).id;
  await assert.rejects(insert(userA, 'https://127.0.0.1/push'), /oda_push_endpoint_allowed/);
  await assert.rejects(insert(userA, 'https://fcm.googleapis.com/fcm/send/bad-zone', times, 'Not/AZone'), /timezone/);
  await assert.rejects(insert(userA, 'https://fcm.googleapis.com/fcm/send/bad-times', { ...times, night: times.morning }), /distinct/);

  // Fixtures predate today's schedule; production trigger forbids user backdating.
  await db.exec(`alter table public.oda_push_subscriptions disable trigger user;
    update public.oda_push_subscriptions set created_at = now() - interval '1 day';
    alter table public.oda_push_subscriptions enable trigger user;`);
  const first = await db.query('select * from public.oda_claim_due_nudges(100)');
  assert.equal(first.rows.length, 6, 'all six distinct recent slots should be claimed');
  assert.equal(new Set(first.rows.map((row: { slot: string }) => row.slot)).size, 6);
  assert.equal((await db.query('select * from public.oda_claim_due_nudges(100)')).rows.length, 0, 'second invocation cannot claim them again');

  const dst = await db.query<{ spring: string; autumn: string }>(`select
    extract(epoch from (timestamp '2026-03-29 02:30' at time zone 'Europe/Berlin'))::bigint::text as spring,
    extract(epoch from (timestamp '2026-10-25 02:30' at time zone 'Europe/Berlin'))::bigint::text as autumn`);
  assert.equal(Number(dst.rows[0].spring), Date.parse('2026-03-29T01:30:00Z') / 1000);
  assert.equal(Number(dst.rows[0].autumn), Date.parse('2026-10-25T01:30:00Z') / 1000);

  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${userB}', false);`);
  assert.equal((await db.query('select * from public.oda_push_subscriptions')).rows.length, 0, 'a second member cannot read the first member');
  await assert.rejects(insert(), /row-level security/);
  await assert.rejects(db.query('select * from public.oda_claim_due_nudges(1)'), /permission denied/);
  await assert.rejects(db.query('select * from public.oda_push_deliveries'), /permission denied/);
  await db.query('delete from public.oda_push_subscriptions where id=$1', [id]);
  await db.exec(`select set_config('request.jwt.claim.sub', '${userA}', false);`);
  assert.equal((await db.query('select * from public.oda_push_subscriptions')).rows.length, 1, 'another member cannot delete the first member');
  await db.query('delete from public.oda_push_subscriptions where id=$1', [id]);
  assert.equal((await db.query('select * from public.oda_push_subscriptions')).rows.length, 0, 'the owner can disable their device');
  await db.exec('reset role');
  assert.equal((await db.query('select * from public.oda_push_deliveries')).rows.length, 0, 'deleting a device removes its delivery ledger');
  for (let index = 0; index < 10; index += 1) await insert(userB, `https://fcm.googleapis.com/fcm/send/device-${index}`);
  await assert.rejects(insert(userB, 'https://fcm.googleapis.com/fcm/send/device-11'), /ten notification devices/);
  console.log('PASS: real PostgreSQL schema, rerun, six slots, idempotent claims, DST, RLS, endpoint/time validation, device cap, unsubscribe cascade');
} finally {
  await db.close();
}
