create table public.aesthetics_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  primary_concern text not null,
  top_category_id text not null,
  alternative_category_ids text[] not null default '{}',
  rules_version text not null,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aesthetics_plans_user_unique unique (user_id)
);

alter table public.aesthetics_plans enable row level security;

create policy "plans_select_own" on public.aesthetics_plans
  for select using (user_id = auth.uid());

create policy "plans_insert_own" on public.aesthetics_plans
  for insert with check (user_id = auth.uid());

create policy "plans_update_own" on public.aesthetics_plans
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plans_delete_own" on public.aesthetics_plans
  for delete using (user_id = auth.uid());
