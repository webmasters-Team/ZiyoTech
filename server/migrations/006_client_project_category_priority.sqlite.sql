ALTER TABLE client_projects ADD COLUMN category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE client_projects ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent'));
CREATE INDEX idx_client_projects_status_deadline ON client_projects (status, target_completion_date);
CREATE INDEX idx_client_projects_category ON client_projects (category, created_at DESC);
