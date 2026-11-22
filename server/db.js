import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { Pool, types } from 'pg';
import { parse as parseConnectionString } from 'pg-connection-string';

const context = new AsyncLocalStorage();
let sqlite;
let pool;
let provider;
let initialization;
let sqliteLock = Promise.resolve();

types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(1700, (value) => Number(value));
types.setTypeParser(1184, (value) => new Date(value).toISOString());

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT, status TEXT DEFAULT 'active',
  language TEXT DEFAULT 'uz', bot_enabled INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, business_id TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL,
  price INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'UZS', stock INTEGER NOT NULL DEFAULT 0,
  description TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (business_id) REFERENCES businesses(id)
);
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY, business_id TEXT NOT NULL, customer_name TEXT, phone TEXT, channel TEXT, source TEXT,
  status TEXT DEFAULT 'new', note TEXT, interested_product TEXT, conversation_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (business_id) REFERENCES businesses(id)
);
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, business_id TEXT NOT NULL, customer_name TEXT, customer_identifier TEXT, channel TEXT,
  chat_id TEXT, last_message TEXT, status TEXT DEFAULT 'active', assigned_to TEXT,
  ai_enabled INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);
CREATE TABLE IF NOT EXISTS ai_settings (
  id TEXT PRIMARY KEY, business_id TEXT NOT NULL, assistant_name TEXT DEFAULT 'ZiyoTech Sales Agent',
  welcome_message TEXT, company_description TEXT, business_hours TEXT,
  supported_languages TEXT DEFAULT 'uz,ru,en', sales_instructions TEXT, faq TEXT, human_handoff TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);
CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, business_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ai', text TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id), FOREIGN KEY (business_id) REFERENCES businesses(id)
);
CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, full_name TEXT NOT NULL DEFAULT '',
  photo_url TEXT, auth_provider TEXT NOT NULL, email_verified INTEGER NOT NULL DEFAULT 0,
  account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE','DISABLED','SUSPENDED')),
  role TEXT NOT NULL DEFAULT 'user', registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS user_sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, csrf_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE TABLE IF NOT EXISTS admin_credentials (
  account_id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_salt TEXT NOT NULL, password_hash TEXT NOT NULL,
  hash_params TEXT NOT NULL DEFAULT 'scrypt-N32768-r8-p1',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, csrf_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_account_id ON admin_sessions(account_id);
CREATE TABLE IF NOT EXISTS analytics_visitors (
  visitor_id TEXT PRIMARY KEY, visitor_number INTEGER NOT NULL UNIQUE, created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL, device_category TEXT NOT NULL DEFAULT 'unknown',
  browser_category TEXT NOT NULL DEFAULT 'unknown', referral_source TEXT, country_code TEXT
);
CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id TEXT PRIMARY KEY, visitor_id TEXT NOT NULL, user_id TEXT, started_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL, ended_at TEXT, active_seconds INTEGER NOT NULL DEFAULT 0,
  last_heartbeat_at TEXT NOT NULL, was_visible INTEGER NOT NULL DEFAULT 1,
  was_active INTEGER NOT NULL DEFAULT 1, last_activity_at TEXT,
  FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id), FOREIGN KEY (user_id) REFERENCES user_accounts(id)
);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(visitor_id, started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user ON analytics_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen_at);
CREATE TABLE IF NOT EXISTS analytics_page_views (
  event_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, page_path TEXT NOT NULL, occurred_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session ON analytics_page_views(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_occurred ON analytics_page_views(occurred_at);
CREATE TABLE IF NOT EXISTS analytics_aggregate_visit_hours (
  hour_utc TEXT PRIMARY KEY, visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0)
);`;

function ensureSqliteColumns() {
  const migrationPlan = [
    ['leads', [['phone', 'TEXT'], ['interested_product', 'TEXT'], ['conversation_id', 'TEXT']]],
    ['conversations', [['customer_identifier', 'TEXT'], ['assigned_to', 'TEXT'], ['ai_enabled', 'INTEGER DEFAULT 0']]],
    ['analytics_sessions', [['last_activity_at', 'TEXT']]],
  ];
  for (const [table, columns] of migrationPlan) {
    const current = new Set(sqlite.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name));
    for (const [name, type] of columns) {
      if (!current.has(name)) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
    }
  }
}

function seedSqliteIfEmpty() {
  const { count } = sqlite.prepare('SELECT COUNT(*) AS count FROM businesses').get();
  if (count !== 0) return;
  const addBusiness = sqlite.prepare(`INSERT INTO businesses (id,name,type,status,language,bot_enabled) VALUES (?,?,?,?,?,?)`);
  const addProduct = sqlite.prepare(`INSERT INTO products (id,business_id,name,category,price,currency,stock,description) VALUES (?,?,?,?,?,?,?,?)`);
  sqlite.transaction(() => {
    addBusiness.run('demo-business', 'Malditaia', 'electronics', 'active', 'uz', 1);
    const products = [
      ['phone-1','Samsung Galaxy A35','smartphone',3300000,'UZS',12,'Balanced smartphone with strong camera and battery'],
      ['phone-2','Tecno Camon 30','smartphone',2750000,'UZS',9,'Camera-focused smartphone with premium photo results'],
      ['phone-3','Realme C75','smartphone',2100000,'UZS',18,'Affordable everyday smartphone with solid performance'],
      ['watch-1','Xiaomi Smart Watch','wearable',980000,'UZS',22,'Smart watch for fitness and notifications'],
      ['earbuds-1','Noise Buds X','audio',640000,'UZS',27,'Wireless earbuds with rich sound and long battery life'],
    ];
    for (const [id, name, category, price, currency, stock, description] of products) {
      addProduct.run(id, 'demo-business', name, category, price, currency, stock, description);
    }
  })();
}

function postgresPoolConfig(connectionString) {
  const config = parseConnectionString(connectionString);
  const ssl = { ...(config.ssl || {}), rejectUnauthorized: true };
  if (process.env.DATABASE_SSL_CA) ssl.ca = process.env.DATABASE_SSL_CA;
  if (process.env.DATABASE_SSL_CA_FILE) ssl.ca = fs.readFileSync(path.resolve(process.env.DATABASE_SSL_CA_FILE), 'utf8');
  config.ssl = ssl;
  config.max = Math.max(1, Math.min(10, Number.parseInt(process.env.DATABASE_POOL_MAX || '5', 10) || 5));
  config.connectionTimeoutMillis = 10000;
  config.idleTimeoutMillis = 10000;
  config.application_name = 'ziyotech-backend';
  return config;
}

export async function createPostgresPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('DATABASE_URL is required for PostgreSQL.');
  return new Pool(postgresPoolConfig(connectionString));
}

async function verifyPostgresSchema() {
  let result;
  try {
    result = await pool.query('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');
  } catch (error) {
    if (error?.code === '42P01') throw new Error('PostgreSQL schema is not initialized. Inspect the target, then run the explicit migration command.');
    throw new Error('PostgreSQL schema could not be verified.');
  }
  if (Number(result.rows[0]?.version) < 2) throw new Error('PostgreSQL schema migrations are incomplete.');
}

export async function initializeDatabase({ forceSqlite = false, sqlitePath, seedDemoData = true } = {}) {
  if (initialization) return initialization;
  initialization = (async () => {
    if (process.env.NODE_ENV === 'production' && (!process.env.DATABASE_URL || forceSqlite)) {
      throw new Error('Production requires DATABASE_URL and PostgreSQL; refusing to initialize SQLite.');
    }

    if (process.env.DATABASE_URL && !forceSqlite) {
      provider = 'postgres';
      pool = await createPostgresPool();
      try {
        await pool.query('SELECT 1');
        await verifyPostgresSchema();
      } catch (error) {
        await pool.end();
        pool = undefined;
        provider = undefined;
        throw error;
      }
      return;
    }

    provider = 'sqlite';
    const filename = sqlitePath || process.env.SQLITE_PATH || path.join(path.dirname(fileURLToPath(import.meta.url)), 'ziyo_sales_ai.db');
    sqlite = new Database(filename);
    sqlite.pragma('journal_mode = WAL');
    sqlite.exec(SQLITE_SCHEMA);
    ensureSqliteColumns();
    if (seedDemoData) seedSqliteIfEmpty();
  })();
  try { await initialization; } catch (error) { initialization = undefined; throw error; }
}

export function getDatabaseDialect() {
  return provider;
}

function normalizeParams(args) {
  return args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
}

export function convertPlaceholders(sql) {
  let output = '';
  let index = 0;
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (lineComment) { output += ch; if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { output += ch; if (ch === '*' && next === '/') { output += next; i += 1; blockComment = false; } continue; }
    if (quote) {
      output += ch;
      if (ch === quote && next === quote) { output += next; i += 1; }
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '-' && next === '-') { output += ch + next; i += 1; lineComment = true; continue; }
    if (ch === '/' && next === '*') { output += ch + next; i += 1; blockComment = true; continue; }
    if (ch === "'" || ch === '"') { quote = ch; output += ch; continue; }
    if ((i === 0 || /[\s)]/.test(sql[i - 1])) && /^AS\s+([a-z_][a-zA-Z0-9_]*)/i.test(sql.slice(i))) {
      const [aliasClause, alias] = sql.slice(i).match(/^AS\s+([a-z_][a-zA-Z0-9_]*)/i);
      output += `AS "${alias}"`;
      i += aliasClause.length - 1;
      continue;
    }
    if (ch === '?') { index += 1; output += `$${index}`; continue; }
    output += ch;
  }
  return output;
}

async function acquireSqliteLock() {
  let release;
  const current = sqliteLock;
  sqliteLock = new Promise((resolve) => { release = resolve; });
  await current;
  return release;
}

async function execute(sql, args, mode) {
  if (!provider) await initializeDatabase();
  if (provider === 'sqlite') {
    const inTransaction = context.getStore()?.provider === 'sqlite';
    const release = inTransaction ? null : await acquireSqliteLock();
    try {
      const statement = sqlite.prepare(sql);
      const params = normalizeParams(args);
      if (mode === 'get') return statement.get(...params);
      if (mode === 'all') return statement.all(...params);
      const result = statement.run(...params);
      return { changes: result.changes, rowCount: result.changes, lastInsertRowid: result.lastInsertRowid };
    } finally { release?.(); }
  }

  const params = normalizeParams(args);
  const query = convertPlaceholders(sql);
  const transaction = context.getStore();
  const result = transaction?.provider === 'postgres'
    ? await transaction.client.query(query, params)
    : await pool.query(query, params);
  if (mode === 'get') return result.rows[0];
  if (mode === 'all') return result.rows;
  return { changes: result.rowCount, rowCount: result.rowCount, rows: result.rows };
}

async function withTransaction(callback, args = []) {
  if (!provider) await initializeDatabase();
  const existing = context.getStore();
  if (existing?.provider === provider) return callback(...args);
  if (provider === 'postgres') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const value = await context.run({ provider: 'postgres', client }, () => callback(...args));
      await client.query('COMMIT');
      return value;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  const release = await acquireSqliteLock();
  try {
    sqlite.exec('BEGIN IMMEDIATE');
    const value = await context.run({ provider: 'sqlite' }, () => callback(...args));
    sqlite.exec('COMMIT');
    return value;
  } catch (error) {
    try { sqlite.exec('ROLLBACK'); } catch { /* Preserve the original failure. */ }
    throw error;
  } finally { release(); }
}

const database = {
  get dialect() { return provider; },
  prepare(sql) {
    return {
      get: (...args) => execute(sql, args, 'get'),
      all: (...args) => execute(sql, args, 'all'),
      run: (...args) => execute(sql, args, 'run'),
    };
  },
  transaction(callback) { return (...args) => withTransaction(callback, args); },
  async exec(sql) {
    if (!provider) await initializeDatabase();
    if (provider === 'postgres') return pool.query(sql);
    return sqlite.exec(sql);
  },
  async close() {
    if (provider === 'postgres' && pool) await pool.end();
    else if (provider === 'sqlite' && sqlite?.open) sqlite.close();
    pool = undefined;
    sqlite = undefined;
    provider = undefined;
    initialization = undefined;
  },
};

export function getDb() {
  return database;
}

export const isUniqueConstraintError = (error) =>
  error?.code === 'SQLITE_CONSTRAINT_UNIQUE' || error?.code === '23505';

export async function closeDatabase() {
  await database.close();
}
