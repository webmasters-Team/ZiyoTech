import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'ziyo_sales_ai.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const ensureTableColumns = () => {
  const migrationPlan = [
    {
      table: 'leads',
      columns: [
        { name: 'phone', type: 'TEXT' },
        { name: 'interested_product', type: 'TEXT' },
        { name: 'conversation_id', type: 'TEXT' },
      ],
    },
    {
      table: 'conversations',
      columns: [
        { name: 'customer_identifier', type: 'TEXT' },
        { name: 'assigned_to', type: 'TEXT' },
        { name: 'ai_enabled', type: 'INTEGER DEFAULT 0' },
      ],
    },
    {
      table: 'analytics_sessions',
      columns: [
        { name: 'last_activity_at', type: 'TEXT' },
      ],
    },
  ];

  for (const { table, columns } of migrationPlan) {
    const existingColumns = db.prepare(`PRAGMA table_info(${table})`).all();
    const columnNames = new Set(existingColumns.map((column) => column.name));

    for (const column of columns) {
      if (columnNames.has(column.name)) {
        continue;
      }

      const sql = `ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.type}`;
      db.exec(sql);
    }
  }
};

db.exec(`
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'active',
    language TEXT DEFAULT 'uz',
    bot_enabled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UZS',
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    customer_name TEXT,
    phone TEXT,
    channel TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    note TEXT,
    interested_product TEXT,
    conversation_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    customer_name TEXT,
    customer_identifier TEXT,
    channel TEXT,
    chat_id TEXT,
    last_message TEXT,
    status TEXT DEFAULT 'active',
    assigned_to TEXT,
    ai_enabled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS ai_settings (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    assistant_name TEXT DEFAULT 'ZiyoTech Sales Agent',
    welcome_message TEXT,
    company_description TEXT,
    business_hours TEXT,
    supported_languages TEXT DEFAULT 'uz,ru,en',
    sales_instructions TEXT,
    faq TEXT,
    human_handoff TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS conversation_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ai',
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
  );

  CREATE TABLE IF NOT EXISTS user_accounts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    full_name TEXT NOT NULL DEFAULT '',
    photo_url TEXT,
    auth_provider TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'DISABLED', 'SUSPENDED')),
    role TEXT NOT NULL DEFAULT 'user',
    registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    csrf_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

  CREATE TABLE IF NOT EXISTS admin_credentials (
    account_id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    hash_params TEXT NOT NULL DEFAULT 'scrypt-N32768-r8-p1',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    csrf_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_account_id ON admin_sessions(account_id);

  CREATE TABLE IF NOT EXISTS analytics_visitors (
    visitor_id TEXT PRIMARY KEY,
    visitor_number INTEGER NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    device_category TEXT NOT NULL DEFAULT 'unknown',
    browser_category TEXT NOT NULL DEFAULT 'unknown',
    referral_source TEXT,
    country_code TEXT
  );

  CREATE TABLE IF NOT EXISTS analytics_sessions (
    session_id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    user_id TEXT,
    started_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    ended_at TEXT,
    active_seconds INTEGER NOT NULL DEFAULT 0,
    last_heartbeat_at TEXT NOT NULL,
    last_activity_at TEXT,
    was_visible INTEGER NOT NULL DEFAULT 1,
    was_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id),
    FOREIGN KEY (user_id) REFERENCES user_accounts(id)
  );
  CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(visitor_id, started_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user ON analytics_sessions(user_id, started_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen_at);

  CREATE TABLE IF NOT EXISTS analytics_page_views (
    event_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session ON analytics_page_views(session_id, occurred_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_page_views_occurred ON analytics_page_views(occurred_at);

  CREATE TABLE IF NOT EXISTS analytics_aggregate_visit_hours (
    hour_utc TEXT PRIMARY KEY,
    visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0)
  );
`);

ensureTableColumns();

const seed = db.prepare('SELECT COUNT(*) AS count FROM businesses').get();
if (seed.count === 0) {
  const insertBusiness = db.prepare(`
    INSERT INTO businesses (id, name, type, status, language, bot_enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertBusiness.run('demo-business', 'Malditaia', 'electronics', 'active', 'uz', 1);

  const productInsert = db.prepare(`
    INSERT INTO products (id, business_id, name, category, price, currency, stock, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts = [
    ['phone-1', 'demo-business', 'Samsung Galaxy A35', 'smartphone', 3300000, 'UZS', 12, 'Balanced smartphone with strong camera and battery'],
    ['phone-2', 'demo-business', 'Tecno Camon 30', 'smartphone', 2750000, 'UZS', 9, 'Camera-focused smartphone with premium photo results'],
    ['phone-3', 'demo-business', 'Realme C75', 'smartphone', 2100000, 'UZS', 18, 'Affordable everyday smartphone with solid performance'],
    ['watch-1', 'demo-business', 'Xiaomi Smart Watch', 'wearable', 980000, 'UZS', 22, 'Smart watch for fitness and notifications'],
    ['earbuds-1', 'demo-business', 'Noise Buds X', 'audio', 640000, 'UZS', 27, 'Wireless earbuds with rich sound and long battery life'],
  ];

  for (const product of sampleProducts) {
    productInsert.run(product);
  }
}

export function getDb() {
  return db;
}
