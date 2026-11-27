import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveAdminPasswordVerifier,
  matchesConfirmation,
  rotateExistingAdministrator,
  validatePassword,
  validateProductionRotationTarget,
} from '../server/productionAdminPasswordRotation.mjs';
import { firebaseAuthTimePredatesCredentialRotation } from '../server/userAccountService.js';

const productionUrl = 'postgresql://postgres.zcfdillzytjsqgrrevhw:fixture-only@localhost:5432/postgres';

test('production rotation requires explicit authorization, production runtime, and exact protected project identity', () => {
  assert.throws(() => validateProductionRotationTarget({
    databaseUrl: productionUrl,
    expectedProjectRef: 'zcfdillzytjsqgrrevhw',
    authorization: '',
    productionRuntime: true,
  }), /explicit production rotation authorization/i);
  assert.throws(() => validateProductionRotationTarget({
    databaseUrl: productionUrl,
    expectedProjectRef: 'anotherproject123',
    authorization: 'YES',
    productionRuntime: true,
  }), /does not match/i);
  assert.throws(() => validateProductionRotationTarget({
    databaseUrl: productionUrl,
    expectedProjectRef: 'zcfdillzytjsqgrrevhw',
    authorization: 'YES',
    productionRuntime: false,
  }), /production operations environment/i);
  assert.equal(validateProductionRotationTarget({
    databaseUrl: productionUrl,
    expectedProjectRef: 'zcfdillzytjsqgrrevhw',
    authorization: 'YES',
    productionRuntime: true,
  }), 'zcfdillzytjsqgrrevhw');
});

test('production and administrator confirmations require exact typed phrases', () => {
  assert.equal(matchesConfirmation('CONFIRM DATABASE prod', 'CONFIRM DATABASE prod'), true);
  assert.equal(matchesConfirmation('CONFIRM DATABASE prod', 'confirm database prod'), false);
  assert.equal(matchesConfirmation('CONFIRM ADMIN owner uid-1', 'CONFIRM ADMIN owner uid-2'), false);
});

test('password policy rejects short or mismatched values without exposing either value', () => {
  assert.throws(() => validatePassword('short', 'short'), /at least 14 characters/i);
  assert.throws(() => validatePassword('long-enough-passphrase', 'different-long-passphrase'), /does not match/i);
  assert.equal(validatePassword('long-enough-passphrase', 'long-enough-passphrase'), true);
});

test('password verifier derivation matches the stored scrypt parameter label', async () => {
  const verifier = await deriveAdminPasswordVerifier('long-enough-passphrase', Buffer.alloc(16, 0x31));
  assert.equal(verifier.passwordSalt.length, 32);
  assert.equal(verifier.passwordHash.length, 128);
  assert.equal(verifier.hashParams, 'scrypt-N32768-r8-p1');
});

test('rotation transaction updates only credential data and revokes both session tables', async () => {
  const calls = [];
  const client = { async query(sql, params = []) {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('SELECT u.id')) return { rows: [{ id: 'uid-1', role: 'admin', account_status: 'ACTIVE', email_verified: 1, auth_provider: 'password', username: 'Owner' }] };
    if (sql.includes('UPDATE admin_credentials')) return { rowCount: 1 };
    if (sql.includes('DELETE FROM admin_sessions')) return { rowCount: 2 };
    if (sql.includes('DELETE FROM user_sessions')) return { rowCount: 3 };
    return { rowCount: 0, rows: [] };
  } };
  const result = await rotateExistingAdministrator(client, {
    accountId: 'uid-1', username: 'Owner', passwordSalt: 'salt', passwordHash: 'hash', hashParams: 'scrypt-N32768-r8-p1',
  });
  assert.deepEqual(result, { authProvider: 'password', adminSessionsRevoked: 2, userSessionsRevoked: 3 });
  assert.match(calls[0].sql, /^BEGIN$/);
  assert.match(calls[1].sql, /FOR UPDATE OF u, c$/);
  assert.match(calls[2].sql, /^UPDATE admin_credentials/);
  assert.match(calls[3].sql, /^DELETE FROM admin_sessions/);
  assert.match(calls[4].sql, /^DELETE FROM user_sessions/);
  assert.match(calls[5].sql, /^COMMIT$/);
});

test('rotation transaction rolls back if the confirmed administrator is no longer eligible', async () => {
  const calls = [];
  const client = { async query(sql) {
    calls.push(sql.replace(/\s+/g, ' ').trim());
    if (sql.includes('SELECT u.id')) return { rows: [{ id: 'uid-1', role: 'user', account_status: 'ACTIVE', email_verified: 1 }] };
    return { rowCount: 0, rows: [] };
  } };
  await assert.rejects(rotateExistingAdministrator(client, {
    accountId: 'uid-1', username: 'Owner', passwordSalt: 'salt', passwordHash: 'hash', hashParams: 'scrypt-N32768-r8-p1',
  }), /not an existing active, verified administrator/i);
  assert.deepEqual(calls, ['BEGIN', expectSelect(calls[1]), 'ROLLBACK']);
  assert.equal(calls.some((sql) => sql.startsWith('UPDATE admin_credentials')), false);
});

function expectSelect(sql) {
  assert.match(sql, /^SELECT u\.id/);
  return sql;
}

test('old Firebase auth times cannot recreate sessions after credential rotation', () => {
  const rotatedAt = '2026-11-27T12:00:01.000Z';
  assert.equal(firebaseAuthTimePredatesCredentialRotation(1795780800, rotatedAt), true);
  assert.equal(firebaseAuthTimePredatesCredentialRotation(1795780802, rotatedAt), false);
  assert.equal(firebaseAuthTimePredatesCredentialRotation(undefined, rotatedAt), true);
});
