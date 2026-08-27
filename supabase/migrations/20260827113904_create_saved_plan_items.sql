create table public.saved_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  created_at timestamptz not null default now(),
  constraint saved_plan_items_user_category_unique unique (user_id, category_id)
);

alter table public.saved_plan_items enable row level security;

create policy "saved_plan_items_select_own" on public.saved_plan_items
  for select using (user_id = auth.uid());

create policy "saved_plan_items_insert_own" on public.saved_plan_items
  for insert with check (user_id = auth.uid());

create policy "saved_plan_items_update_own" on public.saved_plan_items
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "saved_plan_items_delete_own" on public.saved_plan_items
  for delete using (user_id = auth.uid());
