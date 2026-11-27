ALTER TABLE client_companies ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE client_projects ADD COLUMN assigned_manager_id TEXT REFERENCES user_accounts(id) ON DELETE SET NULL;
CREATE INDEX idx_client_projects_manager ON client_projects (assigned_manager_id, created_at DESC) WHERE assigned_manager_id IS NOT NULL;
