// Row level security of the cloud backup table, checked on real PostgreSQL (PGlite, in memory).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const A = '00000000-0000-4000-8000-00000000000a';
const B = '00000000-0000-4000-8000-00000000000b';

async function setup() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant usage on schema public to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    insert into auth.users values ('${A}'), ('${B}');
  `);
  const sql = readFileSync('supabase/schema.sql', 'utf8');
  await db.exec(sql);
  await db.exec(sql); // the documented setup can be run twice
  return db;
}
const as = async (db: PGlite, role: 'anon' | 'authenticated' | 'service_role', sub: string | null, q: string, params: unknown[] = []) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub ?? ''}', false); set role ${role};`);
  try { return await db.query(q, params); } finally { await db.exec('reset role;'); }
};

test('each person reads and writes only their own backup; anonymous visitors get nothing', async () => {
  const db = await setup();
  await as(db, 'authenticated', A, `insert into public.oda_user_data(user_id, data) values ($1, '{"n":1}')`, [A]);
  await as(db, 'authenticated', B, `insert into public.oda_user_data(user_id, data) values ($1, '{"n":2}')`, [B]);

  const mine = await as(db, 'authenticated', A, 'select user_id from public.oda_user_data');
  assert.deepEqual(mine.rows.map((r: any) => r.user_id), [A]);

  await assert.rejects(as(db, 'authenticated', A, `insert into public.oda_user_data(user_id, data) values ($1, '{}')`, [B]));
  const upd = await as(db, 'authenticated', A, `update public.oda_user_data set data = '{"hacked":true}' where user_id = $1`, [B]);
  assert.equal(upd.affectedRows ?? 0, 0);
  await assert.rejects(as(db, 'authenticated', A, 'update public.oda_user_data set user_id = $1 where user_id = $2', [B, A]));
  const del = await as(db, 'authenticated', A, 'delete from public.oda_user_data where user_id = $1', [B]);
  assert.equal(del.affectedRows ?? 0, 0);

  await assert.rejects(as(db, 'anon', null, 'select * from public.oda_user_data'));
  const still = await db.query('select data from public.oda_user_data where user_id = $1', [B]);
  assert.deepEqual((still.rows[0] as any).data, { n: 2 });
  await db.close();
});

test('an oversized backup is refused', async () => {
  const db = await setup();
  const big = JSON.stringify({ blob: 'x'.repeat(6 * 1024 * 1024) });
  await assert.rejects(as(db, 'authenticated', A, 'insert into public.oda_user_data(user_id, data) values ($1, $2::jsonb)', [A, big]), /oda_user_data_size/);
  await as(db, 'authenticated', A, 'insert into public.oda_user_data(user_id, data) values ($1, $2::jsonb)', [A, JSON.stringify({ notes: 'x'.repeat(200_000) })]);
  await db.close();
});

test('cloud coach counters: people read only their own rows and cannot write or call the increment', async () => {
  const db = await setup();
  const month = new Date().toISOString().slice(0, 7);
  await as(db, 'service_role', null, `insert into public.ai_usage(user_id, month, count) values ($1, $3, 4), ($2, $3, 9)`, [A, B, month]);
  await as(db, 'service_role', null, `insert into public.ai_tier_cache(user_id, tier) values ($1, 'pro'), ($2, 'coach')`, [A, B]);

  const usage = await as(db, 'authenticated', A, 'select user_id, count from public.ai_usage');
  assert.deepEqual(usage.rows.map((r: any) => [r.user_id, r.count]), [[A, 4]]);
  const tier = await as(db, 'authenticated', A, 'select user_id from public.ai_tier_cache');
  assert.deepEqual(tier.rows.map((r: any) => r.user_id), [A]);

  // No direct writes, not even to their own row, and no way to raise their own allowance.
  await assert.rejects(as(db, 'authenticated', A, `insert into public.ai_usage(user_id, month, count) values ($1, '2020-01', 0)`, [A]));
  await assert.rejects(as(db, 'authenticated', A, 'update public.ai_usage set count = 0 where user_id = $1', [A]));
  await assert.rejects(as(db, 'authenticated', A, 'delete from public.ai_usage where user_id = $1', [A]));
  await assert.rejects(as(db, 'authenticated', A, `insert into public.ai_tier_cache(user_id, tier) values ($1, 'coach') on conflict (user_id) do update set tier = 'coach'`, [A]));
  await assert.rejects(as(db, 'authenticated', A, `update public.ai_tier_cache set tier = 'coach' where user_id = $1`, [A]));
  await assert.rejects(as(db, 'authenticated', A, 'select * from public.ai_increment_usage($1, 1000)', [A]));
  await assert.rejects(as(db, 'authenticated', A, 'select public.ai_refund_usage($1)', [A]));
  await assert.rejects(as(db, 'anon', null, 'select * from public.ai_usage'));
  await assert.rejects(as(db, 'anon', null, 'select * from public.ai_tier_cache'));
  await db.close();
});

test('the monthly increment stops exactly at the limit and a refund gives one back', async () => {
  const db = await setup();
  const inc = async (limit: number) => {
    const r = await as(db, 'service_role', null, 'select allowed, used from public.ai_increment_usage($1, $2)', [A, limit]);
    return [(r.rows[0] as any).allowed, (r.rows[0] as any).used];
  };
  assert.deepEqual(await inc(3), [true, 1]);
  assert.deepEqual(await inc(3), [true, 2]);
  assert.deepEqual(await inc(3), [true, 3]);
  assert.deepEqual(await inc(3), [false, 3]);
  assert.deepEqual(await inc(3), [false, 3]);

  // A higher level (a later upgrade) simply continues from the same count.
  assert.deepEqual(await inc(150), [true, 4]);

  await as(db, 'service_role', null, 'select public.ai_refund_usage($1)', [A]);
  assert.deepEqual(await inc(4), [true, 4]);
  assert.deepEqual(await inc(4), [false, 4]);

  // A zero or missing limit never lets a message through and never creates a row for a new person.
  const zero = await as(db, 'service_role', null, 'select allowed from public.ai_increment_usage($1, 0)', [B]);
  assert.equal((zero.rows[0] as any).allowed, false);
  const none = await db.query('select count(*)::int as n from public.ai_usage where user_id = $1', [B]);
  assert.equal((none.rows[0] as any).n, 0);

  // Many requests in a row never overshoot the limit (the check is in the same statement as the increment).
  await Promise.all(Array.from({ length: 8 }, () => db.query('select * from public.ai_increment_usage($1, 5)', [B])));
  const total = await db.query('select count from public.ai_usage where user_id = $1', [B]);
  assert.equal((total.rows[0] as any).count, 5);

  // Counters follow the account: deleting the user removes them.
  await db.query('delete from auth.users where id = $1', [A]);
  const gone = await db.query('select count(*)::int as n from public.ai_usage where user_id = $1', [A]);
  assert.equal((gone.rows[0] as any).n, 0);
  await db.close();
});
