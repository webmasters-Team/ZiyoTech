-- PostgreSQL-only additive Project Management schema (migration version 3).
-- Apply only through the explicit --apply-project-management migration option.

CREATE TABLE client_companies (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by TEXT NOT NULL REFERENCES user_accounts(id),
  updated_by TEXT NOT NULL REFERENCES user_accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_company_access_codes (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES client_companies(id),
  verifier_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  issued_by TEXT NOT NULL REFERENCES user_accounts(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  revoked_by TEXT REFERENCES user_accounts(id),
  revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_client_access_codes_company ON client_company_access_codes(company_id, issued_at DESC);
CREATE UNIQUE INDEX idx_client_one_active_access_code ON client_company_access_codes(company_id) WHERE status = 'active';

CREATE TABLE client_sessions (
  token_hash TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES client_companies(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_sessions_company ON client_sessions(company_id, expires_at);

CREATE TABLE client_access_attempt_limits (
  key_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL CHECK (attempt_count >= 0)
);
CREATE INDEX idx_client_access_attempt_window ON client_access_attempt_limits(window_started_at);

CREATE TABLE client_projects (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES client_companies(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'blocked', 'delayed', 'completed', 'on_hold')),
  start_date DATE,
  target_completion_date DATE,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  created_by TEXT NOT NULL REFERENCES user_accounts(id),
  updated_by TEXT NOT NULL REFERENCES user_accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_projects_company ON client_projects(company_id, created_at DESC);

CREATE TABLE client_project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight NUMERIC NOT NULL CHECK (weight > 0),
  start_date DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'blocked', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id, project_id)
);
CREATE INDEX idx_client_milestones_project ON client_project_milestones(project_id, due_date);

CREATE TABLE client_project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight NUMERIC NOT NULL CHECK (weight > 0),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'blocked', 'completed')),
  completion_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  due_date DATE,
  development_notes TEXT NOT NULL DEFAULT '',
  blocker TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (milestone_id, project_id) REFERENCES client_project_milestones(id, project_id) ON DELETE CASCADE
);
CREATE INDEX idx_client_tasks_project ON client_project_tasks(project_id, due_date);
CREATE INDEX idx_client_tasks_milestone ON client_project_tasks(milestone_id);

CREATE TABLE client_project_progress_history (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  planned_percentage NUMERIC NOT NULL CHECK (planned_percentage >= 0 AND planned_percentage <= 100),
  actual_percentage NUMERIC NOT NULL CHECK (actual_percentage >= 0 AND actual_percentage <= 100),
  source TEXT NOT NULL
);
CREATE INDEX idx_client_progress_history_project ON client_project_progress_history(project_id, recorded_at);

CREATE TABLE client_project_updates (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES user_accounts(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_project_updates_project ON client_project_updates(project_id, created_at DESC);

CREATE TABLE client_project_resources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'video', 'document', 'link')),
  file_name TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT '',
  size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
  content BYTEA,
  external_url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'client')),
  created_by TEXT NOT NULL REFERENCES user_accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((resource_type = 'link' AND external_url <> '' AND content IS NULL) OR (resource_type <> 'link' AND content IS NOT NULL AND external_url = ''))
);
CREATE INDEX idx_client_project_resources_project ON client_project_resources(project_id, created_at DESC);

CREATE TABLE client_project_activity_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES client_companies(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES client_projects(id) ON DELETE SET NULL,
  actor_id TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'client', 'system')),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_activity_company ON client_project_activity_logs(company_id, created_at DESC);
CREATE INDEX idx_client_activity_project ON client_project_activity_logs(project_id, created_at DESC);
