-- Add project classification, priority, and the current lifecycle statuses.
ALTER TABLE client_projects
  ADD COLUMN category TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE client_projects DROP CONSTRAINT client_projects_status_check;
ALTER TABLE client_projects ADD CONSTRAINT client_projects_status_check
  CHECK (status IN ('planning', 'in_progress', 'under_review', 'blocked', 'delayed', 'on_hold', 'completed', 'cancelled'));

CREATE INDEX idx_client_projects_status_deadline
  ON client_projects (status, target_completion_date);
CREATE INDEX idx_client_projects_category
  ON client_projects (category, created_at DESC);
