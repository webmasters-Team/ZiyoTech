-- Forward-only hardening for installations where migrations 003 and/or 007
-- were already recorded before their RLS/privilege protections were added.
-- Apply only after migrations 003 through 007 are present, via the explicit
-- nonproduction migration workflow. This migration does not modify records.

ALTER TABLE client_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_company_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_access_attempt_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_update_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_project_milestone_approvals ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  client_companies,
  client_company_access_codes,
  client_sessions,
  client_access_attempt_limits,
  client_projects,
  client_project_milestones,
  client_project_tasks,
  client_project_progress_history,
  client_project_updates,
  client_project_resources,
  client_project_activity_logs,
  client_project_stages,
  client_project_update_resources,
  client_project_feedback,
  client_project_milestone_approvals
FROM PUBLIC, anon, authenticated, service_role;
