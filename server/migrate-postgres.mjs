import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPostgresPool } from './db.js';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.supabase.local', override: true, quiet: true });

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(here, 'migrations');
const migrations = [
  { version: 1, name: 'initial_schema', file: '001_initial_schema.sql' },
  { version: 2, name: 'sqlite_import_ledger', file: '002_import_ledger.sql' },
];
const pool = await createPostgresPool();
let client;

try {
  client = await pool.connect();
  const readPublicTables = async () => {
    const result = await client.query(`SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
    return result.rows.map((row) => row.table_name);
  };
  const initialTables = await readPublicTables();
  const initialHasLedger = initialTables.includes('schema_migrations');
  const confirmedEmptyTarget = process.argv.includes('--confirm-empty-target');
  if (!initialHasLedger && initialTables.length > 0) {
    throw new Error('Target has public tables but no migration ledger; refusing to alter it.');
  }
  if (!initialHasLedger && !confirmedEmptyTarget) {
    throw new Error('Empty target inspection passed. Re-run with --confirm-empty-target to create the PostgreSQL schema.');
  }

  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(728391046)');
    const lockedTables = await readPublicTables();
    const lockedHasLedger = lockedTables.includes('schema_migrations');
    if (!lockedHasLedger && lockedTables.length > 0) {
      throw new Error('Target changed after inspection; refusing to alter a non-empty public schema.');
    }
    if (!lockedHasLedger && !confirmedEmptyTarget) {
      throw new Error('Empty target confirmation is required before creating the PostgreSQL schema.');
    }
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    const applied = await client.query('SELECT version FROM schema_migrations');
    const versions = new Set(applied.rows.map((row) => Number(row.version)));
    for (const migration of migrations) {
      if (versions.has(migration.version)) continue;
      const sql = await fs.readFile(path.join(migrationsDirectory, migration.file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [migration.version, migration.name]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
  console.log('PostgreSQL migrations are current. No application records were imported.');
} catch (error) {
  console.error(`PostgreSQL migration stopped safely${error?.code ? ` (${error.code})` : ''}: ${error.message}`);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
