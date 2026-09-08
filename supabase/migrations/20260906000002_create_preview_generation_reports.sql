-- Backs the report-preview Edge Function's flag mechanism (see
-- CLAUDE.md → AI Calls: "report/flag mechanism where required"). Insert
-- only via the service-role key (inside report-preview); a user may read
-- their own reports back but never edit/delete them, and never read
-- another user's report.

create table public.preview_generation_reports (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.preview_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.preview_generation_reports enable row level security;

create policy "preview_generation_reports_select_own" on public.preview_generation_reports
  for select using (user_id = auth.uid());

-- No insert/update/delete policy for authenticated/anon — see
-- report-preview/index.ts, which writes via the service-role key only.
