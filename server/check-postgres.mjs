import dotenv from 'dotenv';
import { parse as parseConnectionString } from 'pg-connection-string';
import { createPostgresPool } from './db.js';
import { assertNonProductionDatabaseTarget } from './databaseTargetGuard.js';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.supabase.local', quiet: true });

let pool;
try {
  assertNonProductionDatabaseTarget();
  const connection = process.env.DATABASE_URL ? parseConnectionString(process.env.DATABASE_URL) : null;
  const projectReference = (connection?.user || '').match(/^postgres\.([a-z0-9]+)$/i)?.[1];
  pool = await createPostgresPool();
  const result = await pool.query('SELECT 1 AS connected');
  const identity = await pool.query('SELECT current_database() AS database, current_schema() AS schema');
  const serverVersion = await pool.query('SHOW server_version');
  const migrations = await pool.query('SELECT version, name FROM public.schema_migrations ORDER BY version').catch(() => ({ rows: [] }));
  const privateTables = await pool.query(`SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
      has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
      has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname IN ('client_project_stages','client_project_update_resources','client_project_feedback','client_project_milestone_approvals')
    ORDER BY c.relname`);
  const stageCount = await pool.query('SELECT COUNT(*)::bigint AS count FROM public.client_project_stages').catch(() => ({ rows: [{ count: null }] }));
  const tables = await pool.query(`SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
  const publicTables = [];
  for (const row of tables.rows) {
    const name = `"${row.table_name.replaceAll('"', '""')}"`;
    const count = await pool.query(`SELECT COUNT(*)::bigint AS count FROM public.${name}`);
    publicTables.push({ table: row.table_name, rows: Number(count.rows[0].count) });
  }
  const sessionPooler = /\.pooler\.supabase\.com$/i.test(connection.host || '') && String(connection.port || '') === '5432';
  console.log(JSON.stringify({
    connected: result.rows[0].connected === 1,
    tlsVerified: true,
    target: {
      provider: sessionPooler ? 'supabase-session-pooler' : 'other',
      projectReference,
      database: identity.rows[0].database,
      schema: identity.rows[0].schema,
      serverVersion: serverVersion.rows[0].server_version,
    },
    migrationVersions: migrations.rows,
    advancedWorkspace: {
      stageRows: Number(stageCount.rows[0].count ?? 0),
      privateTables: privateTables.rows,
    },
    publicTables,
  }));
} catch (error) {
  const codes = [error?.code, error?.cause?.code, ...(error?.errors || []).map((nested) => nested?.code)].filter(Boolean);
  const diagnostic = [error?.name || 'Error', ...new Set(codes)].join('; ');
  console.error(`PostgreSQL connection/inspection failed (${diagnostic}). No schema or records were changed.`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
