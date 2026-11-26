import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

test('application database startup refuses SQLite fallback when PostgreSQL is not configured', () => {
  const dbPath = JSON.stringify(path.resolve('server/db.js'));
  const script = `import { pathToFileURL } from 'node:url'; const { initializeDatabase } = await import(pathToFileURL(${dbPath})); await initializeDatabase();`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'development', SQLITE_PATH: '', DATABASE_URL: '' },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DATABASE_URL is required\. PostgreSQL is the only application runtime database\./);
});

test('SQLite runtime override is rejected outside isolated test mode', () => {
  const dbPath = JSON.stringify(path.resolve('server/db.js'));
  const script = `import { pathToFileURL } from 'node:url'; const { initializeDatabase } = await import(pathToFileURL(${dbPath})); await initializeDatabase({ forceSqlite: true, sqlitePath: ':memory:' });`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'development', DATABASE_URL: '' },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SQLite is available only to isolated tests/);
});
