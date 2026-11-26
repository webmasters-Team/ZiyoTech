import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeProjectRequests,
  normalizeProjectRequest,
  normalizeRequestDate,
  parseProjectRequestStorage,
  sortProjectRequests,
} from '../src/lib/projectRequests.js';

const request = (id, extras = {}) => ({
  id,
  name: `Request ${id}`,
  businessName: '',
  email: '',
  phoneOrTelegram: '',
  serviceId: 'ai-automation',
  projectDesc: '',
  preferredLang: 'en',
  status: 'new',
  source: 'website',
  ...extras,
});

test('normalizes Firestore timestamps and legacy date fields without dropping undated requests', () => {
  const legacy = normalizeProjectRequest(request('legacy', { created_at: '2021-03-05T12:00:00Z' }));
  const firestore = normalizeProjectRequest(request('timestamp', { createdAt: { toDate: () => new Date('2022-06-07T12:00:00Z') } }));
  const absent = normalizeProjectRequest(request('undated'));

  assert.equal(legacy.createdAt, '2021-03-05T12:00:00.000Z');
  assert.equal(firestore.createdAt, '2022-06-07T12:00:00.000Z');
  assert.equal(absent.createdAt, '');
  assert.equal(absent.id, 'undated');
  assert.equal(normalizeRequestDate('not a date'), '');
});

test('merges Firestore records with local-only requests and prefers remote copies of matching IDs', () => {
  const merged = mergeProjectRequests(
    [request('local-only', { createdAt: '2024-01-01' }), request('same-id', { name: 'Cached name' })],
    [request('same-id', { name: 'Firestore name', createdAt: '2024-02-01' })],
  );

  assert.equal(merged.length, 2);
  assert.equal(merged.find((item) => item.id === 'same-id').name, 'Firestore name');
  assert.equal(merged.find((item) => item.id === 'local-only').name, 'Request local-only');
});

test('sorts valid dates newest-first and leaves missing dates visible last', () => {
  const sorted = sortProjectRequests([
    request('missing'),
    request('old', { createdAt: '2020-01-01' }),
    request('new', { createdAt: '2025-01-01' }),
  ]);
  assert.deepEqual(sorted.map((item) => item.id), ['new', 'old', 'missing']);
});

test('does not treat malformed local storage as a safe cache to overwrite', () => {
  assert.deepEqual(parseProjectRequestStorage('{bad json'), { valid: false, requests: [] });
  assert.deepEqual(parseProjectRequestStorage('{"not":"an array"}'), { valid: false, requests: [] });
  assert.deepEqual(parseProjectRequestStorage(null), { valid: true, requests: [] });
});
