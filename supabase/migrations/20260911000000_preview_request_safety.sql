-- A lease serializes provider calls per user without charging for attempts.
create table public.preview_request_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token uuid not null,
  expires_at timestamptz not null
);
alter table public.preview_request_locks enable row level security;
-- No client policies. Only service_role can acquire/release a lease.

alter table public.preview_generations add column deleted_at timestamptz;
create unique index preview_generation_source_unique on public.preview_generations(user_id, source_storage_path);
create index preview_generation_user_month on public.preview_generations(user_id, created_at);

create function public.acquire_preview_request(p_user_id uuid, p_token uuid)
returns text language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if exists(select 1 from preview_request_locks where user_id = p_user_id and expires_at > now()) then
    return 'request_in_progress';
  end if;
  if (select count(*) from preview_generations where user_id = p_user_id
      and created_at >= (date_trunc('month', now() at time zone 'utc') at time zone 'utc')) >= 10 then
    return 'quota_exceeded';
  end if;
  insert into preview_request_locks values (p_user_id, p_token, now() + interval '3 minutes')
    on conflict(user_id) do update set token = excluded.token, expires_at = excluded.expires_at;
  return 'allowed';
end;
$$;
revoke all on function public.acquire_preview_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.acquire_preview_request(uuid, uuid) to service_role;

-- Defense in depth: even a delayed worker or another writer cannot exceed quota.
create function public.guard_preview_success() returns trigger
language plpgsql set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from preview_generations where user_id = new.user_id
      and created_at >= (date_trunc('month', now() at time zone 'utc') at time zone 'utc')) >= 10 then
    raise exception 'preview_quota_exceeded';
  end if;
  return new;
end;
$$;
create trigger guard_preview_success before insert on public.preview_generations
for each row execute function public.guard_preview_success();

update storage.buckets set file_size_limit = 20971520,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('preview-sources', 'preview-results');

-- Explicit UTC boundary; soft-deleted successes still consume quota.
create or replace function public.my_preview_generations_this_month()
returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from public.preview_generations where user_id = auth.uid()
  and created_at >= (date_trunc('month', now() at time zone 'utc') at time zone 'utc');
$$;
