create table public.passport_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treatment text not null,
  entry_date date not null,
  provider text not null default '',
  cost numeric not null default 0,
  product text not null default '',
  amount_units text not null default '',
  area text not null default '',
  notes text not null default '',
  satisfaction smallint not null check (satisfaction between 1 and 5),
  would_do_again boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.passport_entries enable row level security;

create policy "passport_entries_select_own" on public.passport_entries
  for select using (user_id = auth.uid());

create policy "passport_entries_insert_own" on public.passport_entries
  for insert with check (user_id = auth.uid());

create policy "passport_entries_update_own" on public.passport_entries
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "passport_entries_delete_own" on public.passport_entries
  for delete using (user_id = auth.uid());
