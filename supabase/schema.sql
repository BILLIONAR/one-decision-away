-- One Decision Away — cloud sync table (run once in the Supabase SQL editor)
create table if not exists public.oda_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.oda_user_data enable row level security;
create policy "own data select" on public.oda_user_data for select using (auth.uid() = user_id);
create policy "own data insert" on public.oda_user_data for insert with check (auth.uid() = user_id);
create policy "own data update" on public.oda_user_data for update using (auth.uid() = user_id);
