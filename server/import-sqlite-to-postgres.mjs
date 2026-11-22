import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { createPostgresPool } from './db.js';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.supabase.local', override: true, quiet: true });

const TABLES = [
  'businesses', 'user_accounts', 'products', 'leads', 'conversations', 'ai_settings',
  'conversation_messages', 'user_sessions', 'admin_credentials', 'admin_sessions',
  'analytics_visitors', 'analytics_sessions', 'analytics_page_views', 'analytics_aggregate_visit_hours',
];
const TIMESTAMP_COLUMNS = new Set([
  'created_at', 'updated_at', 'registered_at', 'last_login_at', 'expires_at', 'started_at',
  'last_seen_at', 'ended_at', 'last_heartbeat_at', 'last_activity_at', 'occurred_at', 'hour_utc',
]);

function getArgument(name) {
  const prefix = `--${name}=`;
  const item = process.argv.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : null;
}

function asUtcTimestamp(value) {
  if (typeof value !== 'string') return value;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return `${value.replace(' ', 'T')}.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return new Date(value).toISOString();
  const assumedUtc = value.includes('T') ? `${value}Z` : value;
  return new Date(assumedUtc).toISOString();
}

function hashFile(filename) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filename);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function stopSafely(message) {
  const error = new Error(message);
  error.safeMessage = message;
  return error;
}

const sourceArgument = getArgument('source');
if (!sourceArgument) {
  console.error('Specify a verified SQLite backup with --source=<path>. No data was imported.');
  process.exit(2);
}
if (!process.argv.includes('--confirm-empty-target')) {
  console.error('This importer only writes to an inspected empty target. Re-run with --confirm-empty-target after reviewing it.');
  process.exit(2);
}

const sourcePath = path.resolve(sourceArgument);
if (!fs.existsSync(sourcePath)) {
  console.error('SQLite backup file does not exist. No data was imported.');
  process.exit(2);
}

const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
let pool;
let client;
try {
  source.pragma('query_only = ON');
  const integrity = source.pragma('integrity_check', { simple: true });
  if (integrity !== 'ok') throw stopSafely('SQLite integrity check failed.');
  if (source.pragma('foreign_key_check').length) throw stopSafely('SQLite contains foreign-key violations.');
  const actualTables = source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all().map((row) => row.name).sort();
  if (JSON.stringify(actualTables) !== JSON.stringify([...TABLES].sort())) throw stopSafely('SQLite table set differs from the supported migration schema.');
  source.exec('BEGIN');
  const sourceCounts = Object.fromEntries(TABLES.map((table) => [table, source.prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`).get().count]));
  const sourceHash = await hashFile(sourcePath);

  pool = await createPostgresPool();
  client = await pool.connect();
  const migrationVersion = await client.query('SELECT MAX(version) AS version FROM schema_migrations');
  if (Number(migrationVersion.rows[0]?.version) < 2) throw stopSafely('PostgreSQL schema migrations are incomplete.');

  await client.query('BEGIN');
  await client.query(`LOCK TABLE ${TABLES.map((table) => `public.${quoteIdentifier(table)}`).join(', ')} IN SHARE ROW EXCLUSIVE MODE`);

  const targetCounts = {};
  for (const table of TABLES) {
    const result = await client.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
    targetCounts[table] = Number(result.rows[0].count);
  }
  const priorImport = await client.query('SELECT table_counts FROM sqlite_imports WHERE source_sha256 = $1', [sourceHash]);
  if (priorImport.rowCount) {
    const matches = TABLES.every((table) => targetCounts[table] === sourceCounts[table]);
    if (!matches) throw stopSafely('A previous import marker exists but target row counts differ; no changes were made.');
    console.log(JSON.stringify({ imported: false, repeat: true, sourceSha256: sourceHash, counts: sourceCounts }));
    await client.query('COMMIT');
    source.exec('COMMIT');
    process.exitCode = 0;
  } else if (Object.values(targetCounts).some((count) => count !== 0)) {
    throw stopSafely('Target contains records. Import refused; no records were changed.');
  } else {
    try {
      for (const table of TABLES) {
        const columns = source.pragma(`table_info(${quoteIdentifier(table)})`).map((column) => column.name);
        const names = columns.map(quoteIdentifier).join(', ');
        const placeholders = columns.map((_column, i) => `$${i + 1}`).join(', ');
        const insert = `INSERT INTO public.${quoteIdentifier(table)} (${names}) VALUES (${placeholders})`;
        for (const row of source.prepare(`SELECT ${names} FROM ${quoteIdentifier(table)}`).iterate()) {
          const values = columns.map((column) => TIMESTAMP_COLUMNS.has(column) && row[column] != null ? asUtcTimestamp(row[column]) : row[column]);
          await client.query(insert, values);
        }
      }
      await client.query(`SELECT setval('analytics_visitor_number_seq',
        GREATEST(COALESCE((SELECT MAX(visitor_number) FROM analytics_visitors), 1), 1),
        EXISTS (SELECT 1 FROM analytics_visitors))`);
      const verifiedCounts = {};
      for (const table of TABLES) {
        const result = await client.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
        verifiedCounts[table] = Number(result.rows[0].count);
      }
      if (!TABLES.every((table) => verifiedCounts[table] === sourceCounts[table])) throw stopSafely('Post-import row-count validation failed.');
      await client.query('INSERT INTO sqlite_imports (source_sha256, table_counts) VALUES ($1, $2::jsonb)', [sourceHash, JSON.stringify(sourceCounts)]);
      await client.query('COMMIT');
      console.log(JSON.stringify({ imported: true, sourceSha256: sourceHash, counts: verifiedCounts }));
      source.exec('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    }
  }
} catch (error) {
  await client?.query('ROLLBACK').catch(() => {});
  try { source.exec('ROLLBACK'); } catch { /* Source was not in a read transaction yet. */ }
  const detail = error?.safeMessage || 'Database operation failed; no values were logged.';
  console.error(`SQLite import stopped safely${error?.code ? ` (${error.code})` : ''}: ${detail}`);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool?.end();
  source.close();
}
