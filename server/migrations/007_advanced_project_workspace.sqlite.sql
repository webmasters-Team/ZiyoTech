-- Local isolated-test schema counterpart. Runtime application database remains PostgreSQL.
ALTER TABLE client_projects ADD COLUMN impact TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE client_project_tasks ADD COLUMN stage_id TEXT;
ALTER TABLE client_project_milestones ADD COLUMN client_visible INTEGER NOT NULL DEFAULT 1;
ALTER TABLE client_project_updates ADD COLUMN stage_id TEXT;
ALTER TABLE client_project_updates ADD COLUMN client_visible INTEGER NOT NULL DEFAULT 1;
ALTER TABLE client_project_resources ADD COLUMN storage_path TEXT;
ALTER TABLE client_project_resources ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
ALTER TABLE client_project_activity_logs ADD COLUMN client_visible INTEGER NOT NULL DEFAULT 0;

CREATE TABLE client_project_stages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stage_order INTEGER NOT NULL CHECK (stage_order >= 0),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'blocked', 'completed')),
  start_date TEXT,
  due_date TEXT,
  completion_percentage REAL NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  client_visible INTEGER NOT NULL DEFAULT 1,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_project_stages_project_order ON client_project_stages(project_id, stage_order);
CREATE INDEX idx_client_project_tasks_stage ON client_project_tasks(stage_id) WHERE stage_id IS NOT NULL;
CREATE INDEX idx_client_project_updates_stage ON client_project_updates(stage_id) WHERE stage_id IS NOT NULL;
CREATE TABLE client_project_update_resources (
  update_id TEXT NOT NULL REFERENCES client_project_updates(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES client_project_resources(id) ON DELETE CASCADE,
  PRIMARY KEY (update_id, resource_id)
);
CREATE TABLE client_project_feedback (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES client_companies(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES client_project_milestones(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'feedback' CHECK (kind IN ('feedback', 'revision_request')),
  message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'revision_requested')),
  admin_response TEXT NOT NULL DEFAULT '',
  responded_by TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  responded_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_project_feedback_project ON client_project_feedback(project_id, created_at DESC);
CREATE INDEX idx_client_project_feedback_company ON client_project_feedback(company_id, status, created_at DESC);
CREATE TABLE client_project_milestone_approvals (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES client_companies(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL REFERENCES client_project_milestones(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL REFERENCES user_accounts(id),
  request_note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested', 'cancelled')),
  client_comment TEXT NOT NULL DEFAULT '',
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT
);
CREATE INDEX idx_client_project_approvals_project ON client_project_milestone_approvals(project_id, requested_at DESC);
CREATE UNIQUE INDEX idx_client_project_one_pending_approval ON client_project_milestone_approvals(milestone_id) WHERE status = 'pending';
