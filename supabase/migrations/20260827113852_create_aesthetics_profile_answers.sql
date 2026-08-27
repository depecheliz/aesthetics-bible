create table public.aesthetics_profile_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  concern text not null,
  area text not null,
  intensity text not null,
  downtime text not null,
  comfort text not null,
  budget text not null,
  rules_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aesthetics_profile_answers_user_unique unique (user_id)
);

alter table public.aesthetics_profile_answers enable row level security;

create policy "profile_answers_select_own" on public.aesthetics_profile_answers
  for select using (user_id = auth.uid());

create policy "profile_answers_insert_own" on public.aesthetics_profile_answers
  for insert with check (user_id = auth.uid());

create policy "profile_answers_update_own" on public.aesthetics_profile_answers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "profile_answers_delete_own" on public.aesthetics_profile_answers
  for delete using (user_id = auth.uid());
