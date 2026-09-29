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

-- ---------------------------------------------------------------------------
-- Cloud coach (supabase/functions/coach-chat): monthly message counter and a
-- 10-minute cache of the member's level. Only the function (service role) writes
-- here; a signed-in person can read their own rows and nothing else. No message
-- text is ever stored, only counts.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  count integer not null default 0 check (count >= 0),
  primary key (user_id, month)
);

create table if not exists public.ai_tier_cache (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null check (tier in ('free', 'essentials', 'pro', 'coach')),
  checked_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;
alter table public.ai_usage force row level security;
alter table public.ai_tier_cache enable row level security;
alter table public.ai_tier_cache force row level security;
revoke all on public.ai_usage, public.ai_tier_cache from anon, authenticated;
grant select on public.ai_usage, public.ai_tier_cache to authenticated;
grant select, insert, update, delete on public.ai_usage, public.ai_tier_cache to service_role;

drop policy if exists "own usage select" on public.ai_usage;
drop policy if exists "own tier select" on public.ai_tier_cache;
create policy "own usage select" on public.ai_usage for select to authenticated using ((select auth.uid()) = user_id);
create policy "own tier select" on public.ai_tier_cache for select to authenticated using ((select auth.uid()) = user_id);

-- Adds one message to this UTC month and refuses in the same statement once the
-- limit is reached, so parallel requests cannot go over it.
create or replace function public.ai_increment_usage(p_user uuid, p_limit integer)
returns table (allowed boolean, used integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_count integer;
begin
  if p_limit is null or p_limit < 1 then
    return query select false, 0;
    return;
  end if;
  insert into public.ai_usage as u (user_id, month, count)
  values (p_user, v_month, 1)
  on conflict (user_id, month) do update set count = u.count + 1 where u.count < p_limit
  returning u.count into v_count;
  if v_count is null then
    select u.count into v_count from public.ai_usage u where u.user_id = p_user and u.month = v_month;
    return query select false, coalesce(v_count, 0);
  else
    return query select true, v_count;
  end if;
end;
$$;

-- Gives a message back when the AI provider could not answer.
create or replace function public.ai_refund_usage(p_user uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.ai_usage set count = count - 1
  where user_id = p_user and month = to_char(now() at time zone 'utc', 'YYYY-MM') and count > 0;
$$;

revoke all on function public.ai_increment_usage(uuid, integer) from public, anon, authenticated;
revoke all on function public.ai_refund_usage(uuid) from public, anon, authenticated;
grant execute on function public.ai_increment_usage(uuid, integer) to service_role;
grant execute on function public.ai_refund_usage(uuid) to service_role;
