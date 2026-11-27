import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBase } from '../src/lib/apiBase.js';

test('local API host follows localhost frontend to keep Lax cookies same-site', () => {
  assert.equal(resolveApiBase('http://127.0.0.1:4001/', true, 'localhost'), 'http://localhost:4001');
});

test('local API host follows 127.0.0.1 frontend', () => {
  assert.equal(resolveApiBase('http://localhost:4001', true, '127.0.0.1'), 'http://127.0.0.1:4001');
});

test('production API host is never rewritten', () => {
  assert.equal(resolveApiBase('https://api.ziyotech.net/', false, 'localhost'), 'https://api.ziyotech.net');
});

test('non-loopback configured API hosts are not rewritten in development', () => {
  assert.equal(resolveApiBase('https://api.example.test', true, 'localhost'), 'https://api.example.test');
});
