// Runs the actual Edge handler and provider adapter with local HTTP/DB test doubles.
// No credentials, network requests, or production data. node --test scripts/check-preview-server.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}, overrides = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      require: (id) =>
        overrides[id] ??
        (id.startsWith('.') ? load(path.resolve(path.dirname(file), id), globals, overrides) : {}),
      Response,
      Request,
      URL,
      AbortController,
      AbortSignal,
      Uint8Array,
      setTimeout,
      clearTimeout,
      crypto: require('node:crypto').webcrypto,
      ...globals,
    },
    { filename: file },
  );
  return exports;
}
const goals = load('supabase/functions/_shared/previewGoals.ts');
const provider = load('supabase/functions/_shared/previewProvider.ts');
test('all existing goals produce distinct, identity-preserving instructions and intensity', () => {
  const prompts = Object.keys(goals.previewGoalInstructions).map((goal) =>
    goals.buildPreviewPrompt(goal, 'subtle'),
  );
  assert.equal(new Set(prompts).size, 6);
  for (const p of prompts) {
    assert.match(p, /Identity preservation/);
    assert.match(p, /subtle/);
    assert.match(p, /Change nothing outside/);
  }
  assert.throws(() => goals.buildPreviewPrompt('__proto__', 'subtle'));
  assert.throws(() => goals.buildPreviewPrompt('Refreshed Look', 'extreme'));
});
test('provider selection is explicit and output URL validation rejects unsafe/malformed responses', () => {
  assert.throws(() => provider.validateProviderConfig({ token: 'test' }));
  for (const output of [
    null,
    {},
    [],
    ['https://replicate.delivery/a', 'https://replicate.delivery/b'],
    'http://replicate.delivery/a',
    'https://localhost/a',
    'https://replicate.delivery.evil/a',
  ])
    assert.throws(() => provider.outputUrl(output));
  assert.equal(
    provider.outputUrl(['https://replicate.delivery/a.jpg']),
    'https://replicate.delivery/a.jpg',
  );
});
const config = { model: 'black-forest-labs/flux-kontext-pro', token: 'test-only' };
test('provider success downloads real bytes; malformed bytes and provider failure reject', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return url.endsWith('/predictions')
      ? Response.json({
          id: 'abc',
          status: 'succeeded',
          output: 'https://replicate.delivery/a.jpg',
        })
      : new Response(new Uint8Array([255, 216, 255, 1]), {
          headers: { 'Content-Type': 'image/jpeg' },
        });
  };
  const result = await provider.callPreviewProvider(
    'https://private/source',
    'preserve identity',
    config,
    fetcher,
  );
  assert.equal(result.resultBytes.length, 4);
  assert.equal(JSON.parse(calls[0].options.body).input.input_image, 'https://private/source');
  await assert.rejects(
    provider.callPreviewProvider('source', 'prompt', config, async (url) =>
      url.endsWith('/predictions')
        ? Response.json({ id: 'abc', status: 'succeeded', output: null })
        : Response.json({}),
    ),
    { code: 'malformed_provider_response' },
  );
  await assert.rejects(
    provider.callPreviewProvider('source', 'prompt', config, async () =>
      Response.json({ id: 'abc', status: 'failed' }),
    ),
    { code: 'generation_failed' },
  );
});

function setup({
  providerFails = false,
  uploadFails = false,
  previous = null,
  lease = 'allowed',
  authenticated = true,
  insertFails = false,
} = {}) {
  let handler;
  const calls = { inserts: [], provider: 0, uploads: 0, removed: [], leases: 0 };
  const db = {
    auth: {
      getUser: async () => ({
        data: { user: authenticated ? { id: 'owner' } : null },
        error: null,
      }),
    },
    rpc: async () => {
      calls.leases++;
      return { data: lease };
    },
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        delete: () => query,
        update: () => query,
        maybeSingle: async () => ({ data: previous }),
        insert: (value) => {
          calls.inserts.push(value);
          return query;
        },
        single: async () => (insertFails ? { error: {} } : { data: { id: 'saved-id' } }),
      };
      return query;
    },
    storage: {
      from: (bucket) => ({
        download: async () => ({
          data: new Blob([new Uint8Array([255, 216, 255, 1])], { type: 'image/jpeg' }),
        }),
        createSignedUrl: async () => ({ data: { signedUrl: 'https://private/source' } }),
        upload: async () => {
          calls.uploads++;
          return { error: uploadFails ? {} : null };
        },
        remove: async (paths) => {
          calls.removed.push({ bucket, paths });
          return {};
        },
      }),
    },
  };
  load(
    'supabase/functions/generate-preview/index.ts',
    {
      Deno: {
        serve: (fn) => {
          handler = fn;
        },
        env: { get: (key) => (key === 'PREVIEW_REPLICATE_MODEL' ? config.model : 'test-only') },
      },
      fetch: async () =>
        Response.json({ subscriber: { entitlements: { premium: { expires_date: null } } } }),
    },
    {
      'jsr:@supabase/supabase-js@2': { createClient: () => db },
      '../_shared/previewProvider.ts': {
        ...provider,
        callPreviewProvider: async (_source, prompt) => {
          calls.provider++;
          calls.prompt = prompt;
          if (providerFails)
            throw new provider.PreviewProviderError('generation_failed', 'Test failure');
          return {
            resultBytes: new Uint8Array([255, 216, 255, 1]),
            providerId: config.model,
            contentType: 'image/jpeg',
            costUsd: null,
          };
        },
      },
    },
  );
  return {
    calls,
    run: (body = {}, authorization = true) =>
      handler(
        new Request('https://local/preview', {
          method: 'POST',
          headers: authorization ? { Authorization: 'Bearer test' } : {},
          body: JSON.stringify({
            sourceStoragePath: 'owner/11111111-1111-4111-8111-111111111111.jpg',
            visualizationGoal: 'Subtle Lip-Volume Look',
            intensity: 'subtle',
            ...body,
          }),
        }),
      ),
  };
}
test('success is recorded only after the generated result is stored; selected goal reaches provider', async () => {
  const { run, calls } = setup();
  assert.equal((await run()).status, 200);
  assert.equal(calls.uploads, 1);
  assert.equal(calls.inserts.length, 1);
  assert.match(calls.prompt, /only to the lips/);
  assert.equal(calls.removed.length, 0);
});
test('provider or storage failure does not consume quota and removes failed source', async () => {
  for (const options of [{ providerFails: true }, { uploadFails: true }]) {
    const { run, calls } = setup(options);
    assert.equal((await run()).status, 502);
    assert.equal(calls.inserts.length, 0);
    assert.equal(calls.removed.length, 1);
  }
});
test('uncertain database commit retains files for recovery', async () => {
  const { run, calls } = setup({ insertFails: true });
  assert.equal((await run()).status, 502);
  assert.equal(calls.removed.length, 0);
});
test('retry returns original saved result without calling provider or inserting another credit', async () => {
  const { run, calls } = setup({
    previous: { id: 'old', result_storage_path: 'owner/result.jpg' },
  });
  assert.equal((await (await run()).json()).generationId, 'old');
  assert.equal(calls.provider, 0);
  assert.equal(calls.inserts.length, 0);
});
test('unauthenticated, unowned, malformed, concurrent and quota-exhausted requests never call provider', async () => {
  for (const [options, body, auth, status] of [
    [{}, {}, false, 401],
    [{ authenticated: false }, {}, true, 401],
    [{}, { sourceStoragePath: 'someone-else/photo.jpg' }, true, 400],
    [{}, { intensity: 'extreme' }, true, 400],
    [{ lease: 'request_in_progress' }, {}, true, 429],
    [{ lease: 'quota_exceeded' }, {}, true, 429],
  ]) {
    const { run, calls } = setup(options);
    assert.equal((await run(body, auth)).status, status);
    assert.equal(calls.provider, 0);
    assert.equal(calls.inserts.length, 0);
  }
});

test('provider timeout is bounded and returned as a failure', async () => {
  const timed = load('supabase/functions/_shared/previewProvider.ts', {
    setTimeout: (callback, ms) => {
      if (ms === 100000) {
        queueMicrotask(callback);
        return 0;
      }
      return setTimeout(callback, ms);
    },
  });
  await assert.rejects(
    timed.callPreviewProvider(
      'source',
      'prompt',
      config,
      async (_url, options) =>
        new Promise((_resolve, reject) => {
          if (options.signal.aborted) reject(new Error('aborted'));
          else
            options.signal.addEventListener('abort', () => reject(new Error('aborted')), {
              once: true,
            });
        }),
    ),
    { code: 'generation_timeout' },
  );
});

test('deletion removes only owned images and retains the quota ledger', async () => {
  for (const owned of [true, false]) {
    let handler;
    const removed = [];
    const updates = [];
    const db = {
      auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
      from: () => {
        const query = {
          select: () => query,
          eq: () => query,
          single: async () => ({
            data: {
              id: 'g',
              source_storage_path: (owned ? 'owner' : 'other') + '/photo.jpg',
              result_storage_path: 'owner/result.jpg',
            },
          }),
          update: (data) => {
            updates.push(data);
            return query;
          },
        };
        return query;
      },
      storage: {
        from: (bucket) => ({
          remove: async (paths) => {
            removed.push({ bucket, paths });
            return {};
          },
        }),
      },
    };
    load(
      'supabase/functions/delete-preview/index.ts',
      {
        Deno: {
          serve: (fn) => {
            handler = fn;
          },
          env: { get: () => 'test-only' },
        },
      },
      { 'jsr:@supabase/supabase-js@2': { createClient: () => db } },
    );
    const response = await handler(
      new Request('https://local/delete', {
        method: 'POST',
        headers: { Authorization: 'Bearer test' },
        body: JSON.stringify({ generationId: 'g' }),
      }),
    );
    assert.equal(response.status, owned ? 200 : 403);
    assert.equal(removed.length, owned ? 2 : 0);
    assert.equal(updates.length, owned ? 1 : 0);
    if (owned) assert.ok(updates[0].deleted_at);
  }
});
