// Usage: node scripts/check-preview-sql.cjs <temporary path to @electric-sql/pglite>
// Executes the real migrations against ephemeral PostgreSQL. No live Supabase access.
const { PGlite } = require(process.argv[2]);
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1, '/') $$;
  `);
  for (const file of [
    '20260906000000_create_preview_generations.sql',
    '20260906000001_create_preview_storage_buckets.sql',
    '20260911000000_preview_request_safety.sql',
  ]) {
    await db.exec(fs.readFileSync('supabase/migrations/' + file, 'utf8'));
  }
  const user = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';
  await db.exec(
    `insert into auth.users values ('${user}'), ('${other}'); grant select on public.preview_generations to authenticated; grant usage on schema storage to authenticated; grant select,insert,delete on storage.objects to authenticated;`,
  );
  const acquire = async (id) =>
    (await db.query('select acquire_preview_request($1,gen_random_uuid()) as status', [id])).rows[0]
      .status;
  assert.equal(await acquire(user), 'allowed');
  assert.equal(await acquire(user), 'request_in_progress');
  assert.equal(
    (await db.query('select count(*)::int as n from preview_generations')).rows[0].n,
    0,
    'reservation does not consume quota',
  );
  await db.query('delete from preview_request_locks where user_id=$1', [user]);
  const insert = (i) =>
    db.query(
      `insert into preview_generations(user_id,provider,source_storage_path,result_storage_path,visualization_goal,intensity) values($1,'test',$2,$3,'Softer-Looking Lines','subtle')`,
      [user, user + '/source-' + i, user + '/result-' + i],
    );
  for (let i = 0; i < 9; i++) await insert(i);
  const concurrent = await Promise.allSettled([insert(9), insert(10)]);
  assert.equal(
    concurrent.filter((r) => r.status === 'fulfilled').length,
    1,
    'only final available credit may commit',
  );
  assert.equal(await acquire(user), 'quota_exceeded');
  await db.query('update preview_generations set deleted_at=now() where user_id=$1', [user]);
  assert.equal(await acquire(user), 'quota_exceeded', 'deletion never refunds a success');
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${other}';`);
  assert.equal(
    (await db.query('select count(*)::int as n from preview_generations')).rows[0].n,
    0,
    'other users cannot read history',
  );
  assert.equal(
    Number((await db.query('select my_preview_generations_this_month() as n')).rows[0].n),
    0,
  );
  await assert.rejects(acquire(user), /permission denied/);
  await assert.rejects(insert(11), /permission denied/);
  await assert.rejects(
    db.query("insert into storage.objects(bucket_id,name) values('preview-sources',$1)", [
      user + '/photo.jpg',
    ]),
    /row-level security/,
  );
  await db.exec(`set request.jwt.claim.sub='${user}';`);
  assert.equal(
    Number((await db.query('select my_preview_generations_this_month() as n')).rows[0].n),
    10,
  );
  await db.query("insert into storage.objects(bucket_id,name) values('preview-sources',$1)", [
    user + '/photo.jpg',
  ]);
  await assert.rejects(
    db.query("insert into storage.objects(bucket_id,name) values('preview-results',$1)", [
      user + '/fake.jpg',
    ]),
    /row-level security/,
  );
  await db.exec('reset role;');
  assert.equal(
    (await db.query('select bool_and(not public) as private from storage.buckets')).rows[0].private,
    true,
  );
  await db.close();
  console.log(
    'PASS: migration execution, reservations, concurrent final credit, success-only quota, deletion accounting, history ownership, private buckets, storage RLS, and privileged RPC boundary.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
