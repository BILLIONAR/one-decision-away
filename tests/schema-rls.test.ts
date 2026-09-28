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
const as = async (db: PGlite, role: 'anon' | 'authenticated', sub: string | null, q: string, params: unknown[] = []) => {
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
