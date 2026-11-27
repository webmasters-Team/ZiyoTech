import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteProjectMedia, readProjectMedia, storeProjectMedia } from '../server/supabaseProjectStorage.js';

const envNames = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET', 'ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE', 'ZIYOTECH_NONPRODUCTION_PROJECT_REF'];

async function withStorageEnv(overrides, callback) {
  const previous = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const previousFetch = globalThis.fetch;
  for (const name of envNames) delete process.env[name];
  Object.assign(process.env, overrides);
  try { await callback(); }
  finally {
    for (const name of envNames) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
    globalThis.fetch = previousFetch;
  }
}

const testProjectRef = 'unitdev12345678';
const devUrl = `postgresql://postgres.${testProjectRef}:unit-test-only@localhost:5432/postgres`;

test('Supabase project media storage is private, size/type constrained, and uses the configured nonproduction project', async () => {
  await withStorageEnv({
    DATABASE_URL: devUrl,
    SUPABASE_URL: `https://${testProjectRef}.supabase.co`,
    SUPABASE_SERVICE_ROLE_KEY: 'unit-test-only-not-a-real-key',
    SUPABASE_STORAGE_BUCKET: 'ziyo-test-private',
    ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE: 'true',
    ZIYOTECH_NONPRODUCTION_PROJECT_REF: testProjectRef,
  }, async () => {
    const calls = [];
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url: String(url), options });
      if (String(url).endsWith('/storage/v1/bucket')) return new Response('{}', { status: 200 });
      if (options.method === 'DELETE') return new Response('{}', { status: 200 });
      if (String(url).includes('/storage/v1/object/')) return (options.method || 'GET') === 'GET'
        ? new Response(Buffer.from('image bytes'))
        : new Response('{}', { status: 200 });
      throw new Error('Unexpected mocked Storage request.');
    };
    const payload = Buffer.from('image bytes');
    const stored = await storeProjectMedia('projects/example/screenshot.png', payload, 'image/png');
    assert.deepEqual(stored, { storagePath: 'projects/example/screenshot.png', sizeBytes: payload.length });
    const bucketBody = JSON.parse(calls[0].options.body);
    assert.equal(bucketBody.public, false);
    assert.equal(bucketBody.file_size_limit, 8 * 1024 * 1024);
    assert.ok(bucketBody.allowed_mime_types.includes('image/png'));
    assert.equal(calls[0].options.headers.apikey, 'unit-test-only-not-a-real-key');
    assert.equal(calls[1].options.headers['x-upsert'], 'false');
    assert.deepEqual(await readProjectMedia('projects/example/screenshot.png'), payload);
    await deleteProjectMedia('projects/example/screenshot.png');
    assert.equal(calls.length, 4);
    await assert.rejects(storeProjectMedia('projects/example/bad.svg', payload, 'image/svg+xml'), /type is not supported/i);
    await assert.rejects(storeProjectMedia('projects/example/large.png', Buffer.alloc(8 * 1024 * 1024 + 1), 'image/png'), /size is invalid/i);
  });
});

test('Supabase project media storage refuses missing service credentials and protected production identity', async () => {
  await withStorageEnv({ DATABASE_URL: devUrl }, async () => {
    globalThis.fetch = async () => { throw new Error('Storage must not be contacted without configuration.'); };
    await assert.rejects(storeProjectMedia('projects/x/a.png', Buffer.from('x'), 'image/png'), { code: 'SUPABASE_STORAGE_NOT_CONFIGURED' });
  });
  await withStorageEnv({
    DATABASE_URL: 'postgresql://postgres.zcfdillzytjsqgrrevhw:unit-test-only@localhost:5432/postgres',
    SUPABASE_SERVICE_ROLE_KEY: 'unit-test-only-not-a-real-key',
    SUPABASE_URL: 'https://zcfdillzytjsqgrrevhw.supabase.co',
    ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE: 'true',
    ZIYOTECH_NONPRODUCTION_PROJECT_REF: 'zcfdillzytjsqgrrevhw',
  }, async () => {
    globalThis.fetch = async () => { throw new Error('Storage must not contact the production project.'); };
    await assert.rejects(storeProjectMedia('projects/x/a.png', Buffer.from('x'), 'image/png'), { code: 'SUPABASE_PROJECT_IDENTITY_UNVERIFIED' });
  });
});
