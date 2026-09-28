-- One Decision Away — cloud sync table (run in the Supabase SQL editor; safe to run again)
create table if not exists public.oda_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- A backup is a JSON document of one person's app data. 5 MB is far above
-- real use and stops the table being used as free storage.
alter table public.oda_user_data drop constraint if exists oda_user_data_size;
alter table public.oda_user_data add constraint oda_user_data_size check (octet_length(data::text) < 5 * 1024 * 1024);

-- Row level security: a signed-in person reads and writes only their own row.
-- Anonymous visitors (the public anon key) get nothing.
alter table public.oda_user_data enable row level security;
alter table public.oda_user_data force row level security;
revoke all on public.oda_user_data from anon;
grant select, insert, update, delete on public.oda_user_data to authenticated;

drop policy if exists "own data select" on public.oda_user_data;
drop policy if exists "own data insert" on public.oda_user_data;
drop policy if exists "own data update" on public.oda_user_data;
drop policy if exists "own data delete" on public.oda_user_data;
create policy "own data select" on public.oda_user_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "own data insert" on public.oda_user_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own data update" on public.oda_user_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own data delete" on public.oda_user_data for delete to authenticated using ((select auth.uid()) = user_id);
