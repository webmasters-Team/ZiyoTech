import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PROJECT_RESOURCE_BYTES, validateExternalProjectResourceUrl, validateProjectResourceBytes } from '../server/projectResourceSecurity.js';

test('protected project media accepts only supported signatures and bounded sizes', () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(validateProjectResourceBytes(pngHeader, 'image/png'), true);
  assert.equal(validateProjectResourceBytes(Buffer.from('<script>alert(1)</script>'), 'image/png'), false);
  assert.equal(validateProjectResourceBytes(Buffer.alloc(MAX_PROJECT_RESOURCE_BYTES + 1, 0), 'application/pdf'), false);
  assert.equal(validateProjectResourceBytes(Buffer.from('%PDF-1.7'), 'application/pdf'), true);
  assert.equal(validateProjectResourceBytes(Buffer.from('GIF89a'), 'image/gif'), false);
});

test('project resource links require public HTTPS URLs without embedded credentials', () => {
  assert.equal(validateExternalProjectResourceUrl('https://preview.example.test/project')?.protocol, 'https:');
  assert.equal(validateExternalProjectResourceUrl('http://preview.example.test'), null);
  assert.equal(validateExternalProjectResourceUrl('https://localhost/preview'), null);
  assert.equal(validateExternalProjectResourceUrl('https://127.0.0.1/private'), null);
  assert.equal(validateExternalProjectResourceUrl('https://user:pass@example.test'), null);
});
