CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'active',
  language TEXT DEFAULT 'uz',
  bot_enabled SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  customer_name TEXT,
  phone TEXT,
  channel TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  note TEXT,
  interested_product TEXT,
  conversation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  customer_name TEXT,
  customer_identifier TEXT,
  channel TEXT,
  chat_id TEXT,
  last_message TEXT,
  status TEXT DEFAULT 'active',
  assigned_to TEXT,
  ai_enabled SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_settings (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assistant_name TEXT DEFAULT 'ZiyoTech Sales Agent',
  welcome_message TEXT,
  company_description TEXT,
  business_hours TEXT,
  supported_languages TEXT DEFAULT 'uz,ru,en',
  sales_instructions TEXT,
  faq TEXT,
  human_handoff TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role TEXT NOT NULL DEFAULT 'ai',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  auth_provider TEXT NOT NULL,
  email_verified SMALLINT NOT NULL DEFAULT 0,
  account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'DISABLED', 'SUSPENDED')),
  role TEXT NOT NULL DEFAULT 'user',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX user_accounts_email_ci ON user_accounts (LOWER(email));

CREATE TABLE user_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

CREATE TABLE admin_credentials (
  account_id TEXT PRIMARY KEY REFERENCES user_accounts(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  hash_params TEXT NOT NULL DEFAULT 'scrypt-N32768-r8-p1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX admin_credentials_username_ci ON admin_credentials (LOWER(username));

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_admin_sessions_account_id ON admin_sessions(account_id);

CREATE TABLE analytics_visitors (
  visitor_id TEXT PRIMARY KEY,
  visitor_number INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  device_category TEXT NOT NULL DEFAULT 'unknown',
  browser_category TEXT NOT NULL DEFAULT 'unknown',
  referral_source TEXT,
  country_code TEXT
);
CREATE SEQUENCE analytics_visitor_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE analytics_sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES analytics_visitors(visitor_id),
  user_id TEXT REFERENCES user_accounts(id),
  started_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  last_heartbeat_at TIMESTAMPTZ NOT NULL,
  was_visible SMALLINT NOT NULL DEFAULT 1,
  was_active SMALLINT NOT NULL DEFAULT 1,
  last_activity_at TIMESTAMPTZ
);
CREATE INDEX idx_analytics_sessions_visitor ON analytics_sessions(visitor_id, started_at);
CREATE INDEX idx_analytics_sessions_user ON analytics_sessions(user_id, started_at);
CREATE INDEX idx_analytics_sessions_last_seen ON analytics_sessions(last_seen_at);

CREATE TABLE analytics_page_views (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_analytics_page_views_session ON analytics_page_views(session_id, occurred_at);
CREATE INDEX idx_analytics_page_views_occurred ON analytics_page_views(occurred_at);

CREATE TABLE analytics_aggregate_visit_hours (
  hour_utc TIMESTAMPTZ PRIMARY KEY,
  visit_count BIGINT NOT NULL DEFAULT 0 CHECK (visit_count >= 0)
);
