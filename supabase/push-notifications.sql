-- Optional ODA Web Push backend. Run as the database owner, after Supabase Auth setup.
-- Does not enable a cron job or subscribe any member by itself.
create table if not exists public.oda_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{87,88}$'),
  auth text not null check (auth ~ '^[A-Za-z0-9_-]{22,24}$'),
  timezone text not null default 'UTC',
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  times jsonb not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Only browser-vendor push services. Prevent authenticated members from making
  -- the privileged sender perform arbitrary HTTP requests (SSRF).
  constraint oda_push_endpoint_allowed check (
    length(endpoint) <= 2048 and endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)/[^#[:space:]]+$'
  )
);

create index if not exists oda_push_subscriptions_member on public.oda_push_subscriptions(user_id);
alter table public.oda_push_subscriptions enable row level security;
revoke all on public.oda_push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.oda_push_subscriptions to authenticated;
grant all on public.oda_push_subscriptions to service_role;

drop policy if exists oda_push_own_select on public.oda_push_subscriptions;
create policy oda_push_own_select on public.oda_push_subscriptions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists oda_push_own_insert on public.oda_push_subscriptions;
create policy oda_push_own_insert on public.oda_push_subscriptions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists oda_push_own_update on public.oda_push_subscriptions;
create policy oda_push_own_update on public.oda_push_subscriptions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists oda_push_own_delete on public.oda_push_subscriptions;
create policy oda_push_own_delete on public.oda_push_subscriptions for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.oda_validate_push_subscription()
returns trigger language plpgsql security definer set search_path = '' as $$
declare slot text; seen_times text[] := '{}';
begin
  if not exists(select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid IANA timezone';
  end if;
  if jsonb_typeof(new.times) <> 'object' or (select count(*) from jsonb_object_keys(new.times)) <> 6 then
    raise exception 'Exactly six notification times are required';
  end if;
  foreach slot in array array['morning','lateMorning','midday','afternoon','evening','night'] loop
    if not (new.times ? slot) or jsonb_typeof(new.times -> slot) <> 'string'
      or (new.times ->> slot) !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'Invalid notification slot';
    end if;
    if (new.times ->> slot) = any(seen_times) then raise exception 'Notification times must be distinct'; end if;
    seen_times := array_append(seen_times, new.times ->> slot);
  end loop;
  if tg_op = 'INSERT' then
    -- Serialize inserts per member so concurrent requests cannot bypass the cap.
    perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
    if (select count(*) from public.oda_push_subscriptions where user_id = new.user_id and endpoint <> new.endpoint) >= 10 then
      raise exception 'At most ten notification devices per member';
    end if;
    new.created_at := now();
  else
    -- Keep identity immutable even when a client supplies arbitrary update fields.
    new.id := old.id;
    new.user_id := old.user_id;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists oda_validate_push_subscription on public.oda_push_subscriptions;
create trigger oda_validate_push_subscription before insert or update on public.oda_push_subscriptions
for each row execute function public.oda_validate_push_subscription();
revoke all on function public.oda_validate_push_subscription() from public, anon, authenticated;

create table if not exists public.oda_push_deliveries (
  subscription_id uuid not null references public.oda_push_subscriptions(id) on delete cascade,
  local_date date not null,
  slot text not null check (slot in ('morning','lateMorning','midday','afternoon','evening','night')),
  due_at timestamptz not null,
  claimed_at timestamptz not null default now(),
  status text not null default 'claimed' check (status in ('claimed','sent','failed','expired')),
  completed_at timestamptz,
  primary key(subscription_id, local_date, slot)
);
alter table public.oda_push_deliveries enable row level security;
revoke all on public.oda_push_deliveries from public, anon, authenticated;
grant all on public.oda_push_deliveries to service_role;

-- Atomically claim each device/date/slot before sending. Concurrent cron invocations
-- cannot send the same slot twice. At-most-once attempt: ambiguous failures are not
-- retried, because push services do not offer end-to-end exactly-once delivery.
create or replace function public.oda_claim_due_nudges(batch_limit integer default 100)
returns table(subscription_id uuid, endpoint text, p256dh text, auth text, locale text,
  local_date date, slot text, slot_index integer, due_at timestamptz)
language sql security definer set search_path = '' as $$
  with candidates as (
    select s.id, s.endpoint, s.p256dh, s.auth, s.locale, day.local_date,
      slots.slot, (slots.ordinality - 1)::integer as slot_index,
      ((day.local_date + (s.times ->> slots.slot)::time) at time zone s.timezone) as due_at
    from public.oda_push_subscriptions s
    cross join lateral (
      select (timezone(s.timezone, now())::date - age.n)::date as local_date
      from generate_series(0, 1) as age(n)
    ) day
    cross join unnest(array['morning','lateMorning','midday','afternoon','evening','night']) with ordinality as slots(slot, ordinality)
    where s.enabled
  ), due as (
    select c.* from candidates c
    join public.oda_push_subscriptions s on s.id = c.id
    where c.due_at <= now() and c.due_at > now() - interval '10 minutes'
      and c.due_at >= s.created_at
      and not exists(select 1 from public.oda_push_deliveries d
        where d.subscription_id = c.id and d.local_date = c.local_date and d.slot = c.slot)
    order by c.due_at, c.id, c.slot_index
    limit greatest(1, least(coalesce(batch_limit, 100), 100))
  ), claimed as (
    insert into public.oda_push_deliveries(subscription_id, local_date, slot, due_at)
    select id, local_date, slot, due_at from due
    on conflict do nothing
    returning subscription_id, local_date, slot
  )
  select due.id, due.endpoint, due.p256dh, due.auth, due.locale,
    due.local_date, due.slot, due.slot_index, due.due_at
  from due join claimed on claimed.subscription_id = due.id
    and claimed.local_date = due.local_date and claimed.slot = due.slot;
$$;
revoke all on function public.oda_claim_due_nudges(integer) from public, anon, authenticated;
grant execute on function public.oda_claim_due_nudges(integer) to service_role;

-- Keep the delivery ledger small; do not prune today's idempotency keys.
create or replace function public.oda_prune_push_deliveries()
returns void language sql security definer set search_path = '' as $$
  delete from public.oda_push_deliveries where claimed_at < now() - interval '7 days';
$$;
revoke all on function public.oda_prune_push_deliveries() from public, anon, authenticated;
grant execute on function public.oda_prune_push_deliveries() to service_role;

-- Cron/Vault setup is intentionally separate. Follow docs/PUSH_NOTIFICATIONS.md
-- after deploying the function, creating its secrets and confirming a test device.
