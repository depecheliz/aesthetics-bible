-- Storage for AI Preview. Two private buckets, never public:
--  - preview-sources: the user's uploaded photo, only ever read by the
--    generate-preview Edge Function (service-role key bypasses these
--    policies entirely) to send to the provider.
--  - preview-results: the generated visualization, readable by the owning
--    user via a signed URL (never a public URL — see BUILD_STATUS.md's
--    "no photo is ever analyzed to diagnose a face" boundary; results stay
--    private the same way source photos do).
--
-- Path convention enforced by these policies: every object's path must
-- start with "<auth.uid()>/", e.g. preview-sources/<uid>/<uuid>.jpg. The
-- client is responsible for uploading to that path; RLS is what actually
-- prevents one user from reading/writing another user's folder even if the
-- client got the path wrong or was tampered with.

insert into storage.buckets (id, name, public)
values ('preview-sources', 'preview-sources', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('preview-results', 'preview-results', false)
on conflict (id) do nothing;

create policy "preview_sources_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'preview-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "preview_sources_select_own_folder" on storage.objects
  for select using (
    bucket_id = 'preview-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "preview_sources_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'preview-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Results are written only by the Edge Function via the service-role key
-- (which bypasses these policies), never directly by the client — so there
-- is deliberately no insert policy for authenticated/anon on this bucket.
create policy "preview_results_select_own_folder" on storage.objects
  for select using (
    bucket_id = 'preview-results'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
