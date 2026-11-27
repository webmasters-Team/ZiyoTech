import test from 'node:test';
import assert from 'node:assert/strict';
import { assertNonProductionDatabaseTarget, getSupabaseProjectReference } from '../server/databaseTargetGuard.js';

const protectedProductionUrl = 'postgresql://postgres.zcfdillzytjsqgrrevhw:unit-test-only@localhost:5432/postgres';
const safeTestUrl = 'postgresql://postgres.unitdev12345678:unit-test-only@localhost:5432/postgres';

test('database target guard recognizes Supabase project references without connecting', () => {
  assert.equal(getSupabaseProjectReference(protectedProductionUrl), 'zcfdillzytjsqgrrevhw');
  assert.equal(getSupabaseProjectReference('not a database url'), null);
});

test('database target guard blocks the known production project even with explicit local opt-in', () => {
  assert.throws(() => assertNonProductionDatabaseTarget({
    databaseUrl: protectedProductionUrl,
    allowedProjectRef: 'zcfdillzytjsqgrrevhw',
    allowDatabaseAccess: 'true',
    productionRuntime: false,
  }), /protected as production/i);
});

test('database target guard requires explicit matching nonproduction opt-in', () => {
  assert.throws(() => assertNonProductionDatabaseTarget({
    databaseUrl: safeTestUrl,
    allowedProjectRef: 'unitdev12345678',
    allowDatabaseAccess: '',
    productionRuntime: false,
  }), /disabled/i);
  assert.throws(() => assertNonProductionDatabaseTarget({
    databaseUrl: safeTestUrl,
    allowedProjectRef: 'anotherproject123',
    allowDatabaseAccess: 'true',
    productionRuntime: false,
  }), /does not match/i);
  assert.equal(assertNonProductionDatabaseTarget({
    databaseUrl: safeTestUrl,
    allowedProjectRef: 'unitdev12345678',
    allowDatabaseAccess: 'true',
    productionRuntime: false,
  }), 'unitdev12345678');
});

test('database target guard always blocks managed production runtimes', () => {
  assert.throws(() => assertNonProductionDatabaseTarget({
    databaseUrl: safeTestUrl,
    allowedProjectRef: 'unitdev12345678',
    allowDatabaseAccess: 'true',
    productionRuntime: true,
  }), /production runtime/i);
});
