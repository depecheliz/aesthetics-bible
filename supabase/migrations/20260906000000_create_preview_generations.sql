-- AI Preview quota tracking.
--
-- Design decision: only a SUCCESSFUL generation ever gets a row here. A
-- failed generation attempt is never written — this is what makes "failed
-- generations do not consume quota" true by construction rather than by a
-- status column that every reader must remember to filter on.
--
-- Only the generate-preview Edge Function (using the service-role key)
-- inserts rows, after a provider call has actually succeeded and a result
-- image exists in Storage. Clients can read their own rows (to show "x of
-- 10 used this month") but can never insert/update/delete directly —
-- otherwise a client could fabricate quota usage or, worse, bypass it.

create table public.preview_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- The provider actually used for this generation (e.g. 'flux_kontext_pro'),
  -- recorded per-row rather than globally so a future provider switch never
  -- rewrites history or corrupts cost telemetry for past generations.
  provider text not null,
  source_storage_path text not null,
  result_storage_path text not null,
  visualization_goal text not null,
  intensity text not null,
  cost_usd numeric(10, 4),
  created_at timestamptz not null default now()
);

alter table public.preview_generations enable row level security;

create policy "preview_generations_select_own" on public.preview_generations
  for select using (user_id = auth.uid());

-- No insert/update/delete policy for authenticated/anon: rows are only ever
-- written by the Edge Function via the service-role key, which bypasses RLS
-- entirely. This is intentional, not an oversight — do not add a client
-- insert policy here.

-- Returns how many successful generations the CALLING user has had since
-- the start of the current calendar month, in UTC. Deliberately takes no
-- user_id parameter — it only ever reads auth.uid(), so no authenticated
-- user can query another user's count. Used by the Edge Function (acting
-- on the calling user's own verified JWT) to enforce the 10/month allowance
-- before calling the provider — checked server-side, never trusted from
-- the client.
create or replace function public.my_preview_generations_this_month()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.preview_generations
  where user_id = auth.uid()
    and created_at >= date_trunc('month', now() at time zone 'utc');
$$;

revoke all on function public.my_preview_generations_this_month() from public, anon;
grant execute on function public.my_preview_generations_this_month() to authenticated;
