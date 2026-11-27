-- Additive project stages, client feedback/approvals, and private Storage metadata.
ALTER TABLE client_projects
  ADD COLUMN impact TEXT NOT NULL DEFAULT 'standard'
    CHECK (impact IN ('standard', 'low', 'medium', 'high', 'critical'));

-- Existing projects without an explicit start date inherit the company creation date.
UPDATE client_projects AS p
SET start_date = c.created_at::date
FROM client_companies AS c
WHERE c.id = p.company_id AND p.start_date IS NULL;

CREATE TABLE client_project_stages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stage_order INTEGER NOT NULL CHECK (stage_order >= 0),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'blocked', 'completed')),
  start_date DATE,
  due_date DATE,
  completion_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  client_visible BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_client_project_stages_project_order ON client_project_stages(project_id, stage_order);
ALTER TABLE client_project_tasks
  ADD COLUMN stage_id TEXT REFERENCES client_project_stages(id) ON DELETE SET NULL;
CREATE INDEX idx_client_project_tasks_stage ON client_project_tasks(stage_id) WHERE stage_id IS NOT NULL;

ALTER TABLE client_project_milestones
  ADD COLUMN client_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE client_project_updates
  ADD COLUMN stage_id TEXT REFERENCES client_project_stages(id) ON DELETE SET NULL,
  ADD COLUMN client_visible BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX idx_client_project_updates_stage ON client_project_updates(stage_id) WHERE stage_id IS NOT NULL;

ALTER TABLE client_project_resources
  ADD COLUMN storage_path TEXT,
  ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
ALTER TABLE client_project_resources DROP CONSTRAINT client_project_resources_check;
ALTER TABLE client_project_resources ADD CONSTRAINT client_project_resources_storage_check CHECK (
  (resource_type = 'link' AND external_url <> '' AND content IS NULL AND storage_path IS NULL)
  OR (resource_type <> 'link' AND external_url = '' AND ((content IS NOT NULL AND storage_path IS NULL) OR (content IS NULL AND storage_path IS NOT NULL)))
);

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
  message TEXT NOT NULL CHECK (length(btrim(message)) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'revision_requested')),
  admin_response TEXT NOT NULL DEFAULT '',
  responded_by TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_client_project_approvals_project ON client_project_milestone_approvals(project_id, requested_at DESC);
CREATE UNIQUE INDEX idx_client_project_one_pending_approval ON client_project_milestone_approvals(milestone_id) WHERE status = 'pending';

ALTER TABLE client_project_activity_logs ADD COLUMN client_visible BOOLEAN NOT NULL DEFAULT FALSE;

-- Give existing projects the standard eight stages. Existing work and history remain untouched.
WITH defaults(stage_order, title) AS (VALUES
  (1, 'Planning and research'),
  (2, 'UI/UX design'),
  (3, 'Frontend development'),
  (4, 'Backend development'),
  (5, 'System integration'),
  (6, 'Testing and quality assurance'),
  (7, 'Deployment'),
  (8, 'Final delivery')
)
INSERT INTO client_project_stages (id, project_id, title, stage_order, status, start_date)
SELECT md5(p.id || ':default-stage:' || d.stage_order::text), p.id, d.title, d.stage_order,
  CASE WHEN d.stage_order = 1 THEN 'in_progress' ELSE 'upcoming' END, p.start_date
FROM client_projects p CROSS JOIN defaults d
WHERE NOT EXISTS (SELECT 1 FROM client_project_stages s WHERE s.project_id = p.id);

ALTER TABLE client_project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_update_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_milestone_approvals ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE
  client_project_stages,
  client_project_update_resources,
  client_project_feedback,
  client_project_milestone_approvals
FROM PUBLIC, anon, authenticated, service_role;
