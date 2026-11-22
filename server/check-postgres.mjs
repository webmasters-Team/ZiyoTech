import dotenv from 'dotenv';
import { parse as parseConnectionString } from 'pg-connection-string';
import { createPostgresPool } from './db.js';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.supabase.local', override: true, quiet: true });

let pool;
try {
  pool = await createPostgresPool();
  const result = await pool.query('SELECT 1 AS connected');
  const connection = parseConnectionString(process.env.DATABASE_URL);
  const identity = await pool.query('SELECT current_database() AS database, current_schema() AS schema');
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
      database: identity.rows[0].database,
      schema: identity.rows[0].schema,
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
