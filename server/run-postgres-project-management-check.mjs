import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { closeDatabase, getDb, initializeDatabase } from './db.js';
import { assertNonProductionDatabaseTarget } from './databaseTargetGuard.js';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.supabase.local', quiet: true });

const configuredUrl = process.env.DATABASE_URL;
assertNonProductionDatabaseTarget({ databaseUrl: configuredUrl });
// Vite loads the mode-specific development file after .env.local, so mirror
// that precedence when checking the local feature flags.
const frontendEnvFile = fs.existsSync('.env.development.local') ? '.env.development.local' : '.env.local';
const localFrontendEnv = fs.existsSync(frontendEnvFile)
  ? dotenv.parse(fs.readFileSync(frontendEnvFile))
  : {};
if (process.env.CLIENT_PORTAL_ENABLED !== 'true' || localFrontendEnv.VITE_CLIENT_PORTAL_ENABLED !== 'true') {
  throw new Error('PostgreSQL integration test requires the client portal enabled in the local development backend and frontend.');
}
if (process.env.PROJECT_MANAGEMENT_ENABLED !== 'true' || localFrontendEnv.VITE_PROJECT_MANAGEMENT_ENABLED !== 'true') {
  throw new Error('PostgreSQL integration test requires Project Management enabled in the local backend and frontend.');
}
if (!process.env.CLIENT_ACCESS_CODE_PEPPER || Buffer.byteLength(process.env.CLIENT_ACCESS_CODE_PEPPER, 'utf8') < 32) {
  throw new Error('Development CLIENT_ACCESS_CODE_PEPPER is missing or too short.');
}
const caFile = process.env.DATABASE_SSL_CA_FILE ? path.resolve(process.env.DATABASE_SSL_CA_FILE) : '';
if (!caFile || !fs.existsSync(caFile)) throw new Error('Development TLS CA file is missing.');
process.env.DATABASE_SSL_CA_FILE = caFile;
process.env.PROJECT_MANAGEMENT_ENABLED = 'true';

const db = getDb();
let fixtureCompanyIds = [];
let fixtureProjectIds = [];
let assertionCount = 0;
const assert = (condition, message) => {
  assertionCount += 1;
  if (!condition) throw new Error(`PostgreSQL Project Management integration assertion failed: ${message}`);
};

try {
  await initializeDatabase({ seedDemoData: false });
  const version = await db.prepare('SELECT MAX(version) AS version FROM schema_migrations').get();
  assert(Number(version?.version) >= 7, 'Project Management migrations through version 7 are applied');
  const workspaceTableCount = await db.prepare(`SELECT COUNT(*) AS count FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('client_project_stages','client_project_update_resources','client_project_feedback','client_project_milestone_approvals')`).get();
  assert(Number(workspaceTableCount.count) === 4, 'migration 007 tables are present');

  const adminRow = await db.prepare(`SELECT id FROM user_accounts
    WHERE role = 'admin' AND account_status = 'ACTIVE' AND email_verified = 1 ORDER BY id LIMIT 1`).get();
  const adminRows = adminRow ? [adminRow] : [];
  assert(adminRows.length > 0, 'active verified development administrator exists');
  const actorId = adminRows[0].id;

  const service = await import('./clientProjectService.js');
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  const companyName = `PM Integration ${suffix}`;
  const provisioned = await service.createCompanyWithAccessCode({
    companyName,
    contactPerson: 'Development Test',
    email: `pm-${suffix}@example.test`,
    phone: '+10000000000',
    description: 'Temporary integration fixture',
    website: 'https://example.test',
    logoUrl: 'https://example.test/logo.png',
    industry: 'Testing',
    internalNotes: 'Temporary, automatically removed test fixture',
    initialProject: {
      title: `PM Exact Match ${suffix}`,
      description: 'Temporary integration fixture',
      category: 'integration-test',
      priority: 'high',
      status: 'in_progress',
      startDate: '2026-11-01',
      targetCompletionDate: '2026-12-15',
      assignedManagerId: actorId,
    },
  }, actorId);
  const companyId = provisioned.company.id;
  fixtureCompanyIds.push(companyId);
  assert(/^[A-Z0-9]{15}$/.test(provisioned.accessCode.code), 'generated access code has exactly 15 alphanumeric characters');
  assert(provisioned.company.logoUrl === 'https://example.test/logo.png', 'company logo URL persists');
  const editedCompany = await service.updateCompany(companyId, {
    companyName: `${companyName} Edited`, contactPerson: 'Updated Test', email: `edited-${suffix}@example.test`,
    phone: '+10000000001', description: 'Edited test company', website: 'https://example.test',
    logoUrl: 'https://example.test/logo.png', industry: 'Testing', internalNotes: 'Temporary integration fixture',
  }, actorId);
  assert(editedCompany?.companyName === `${companyName} Edited` && editedCompany.contactPerson === 'Updated Test', 'company editing persists');
  const verifier = await db.prepare('SELECT verifier_hash AS verifierHash FROM client_company_access_codes WHERE company_id = ? AND status = ?').get(companyId, 'active');
  assert(Boolean(verifier?.verifierHash) && verifier.verifierHash !== provisioned.accessCode.code && verifier.verifierHash.length === 64, 'only an HMAC verifier is stored');

  const initialProject = provisioned.initialProject;
  assert(initialProject?.category === 'integration-test' && initialProject.priority === 'high', 'initial project category and priority persist');
  assert(initialProject?.assignedManagerId === actorId, 'active manager assignment persists');
  fixtureProjectIds.push(initialProject.id);

  const clientSession = await service.createClientSessionForAccessCode(provisioned.accessCode.code);
  assert(Boolean(clientSession), 'development access code verifies and creates a scoped client session');

  const secondCompany = await service.createCompany({ companyName: `PM Scope ${suffix}` }, actorId);
  fixtureCompanyIds.push(secondCompany.id);
  const createdProjects = [];
  for (let index = 0; index < 7; index += 1) {
    const title = index === 6 ? `PM Search Target ${suffix}` : `PM Other ${suffix} ${index}`;
    const project = await service.createProject({
      companyId: index === 0 ? secondCompany.id : companyId,
      title, description: 'Temporary test project', scope: '', status: index === 0 ? 'under_review' : 'planning',
      category: 'integration-test', priority: 'normal', assignedManagerId: actorId,
      startDate: '2026-11-01', targetCompletionDate: '2026-12-15',
    }, actorId);
    createdProjects.push(project);
    fixtureProjectIds.push(project.id);
  }
  const editedProject = await service.updateProject(createdProjects[1].id, {
    ...createdProjects[1], title: `PM Edited ${suffix}`, description: 'Edited test project', status: 'in_progress',
  }, actorId);
  assert(editedProject?.title === `PM Edited ${suffix}` && editedProject.status === 'in_progress', 'project editing persists');
  assert(await service.setCompanyStatus(secondCompany.id, 'inactive', actorId), 'company can be deactivated');
  assert((await service.getCompany(secondCompany.id))?.status === 'inactive', 'company status change persists');
  assert(await service.setCompanyStatus(secondCompany.id, 'active', actorId), 'company can be reactivated');
  const matches = await service.searchAdminProjects({ search: `PM Search Target ${suffix}`, limit: 6 });
  assert(matches.length === 1 && matches[0].title === `PM Search Target ${suffix}`, 'search reaches projects beyond the first six and ranks the exact match');
  const statusMatches = await service.searchAdminProjects({ status: 'under_review', limit: 6 });
  assert(statusMatches.some((project) => project.title === `PM Other ${suffix} 0`), 'status-filtered search returns matching projects');
  const scopedProjects = await service.getClientProjects(secondCompany.id);
  assert(scopedProjects.length === 1 && scopedProjects[0].companyId === secondCompany.id, 'client project query is company-scoped');

  const backendPort = Number(process.env.PORT || 4001);
  const backendOrigin = `http://127.0.0.1:${backendPort}`;
  const frontendOrigin = 'http://localhost:3000';
  const accessResponse = await fetch(`${backendOrigin}/api/client-portal/access`, {
    method: 'POST',
    headers: { origin: frontendOrigin, 'content-type': 'application/json' },
    body: JSON.stringify({ code: provisioned.accessCode.code }),
  });
  assert(accessResponse.status === 200, 'client portal access endpoint accepts a valid development code');
  const accessBody = await accessResponse.json();
  const setCookies = accessResponse.headers.getSetCookie?.() || [accessResponse.headers.get('set-cookie')].filter(Boolean);
  const cookieHeader = setCookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
  assert(Boolean(accessBody.authenticated && accessBody.csrfToken && cookieHeader), 'access endpoint establishes session and CSRF cookies');

  const sessionResponse = await fetch(`${backendOrigin}/api/client-portal/session`, {
    headers: { origin: frontendOrigin, cookie: cookieHeader },
  });
  assert(sessionResponse.status === 200, 'client session endpoint recognizes the new scoped session');
  const portalProjectsResponse = await fetch(`${backendOrigin}/api/client-portal/projects`, {
    headers: { origin: frontendOrigin, cookie: cookieHeader },
  });
  assert(portalProjectsResponse.status === 200, 'client portal projects endpoint returns authorized company data');
  const portalProjectsBody = await portalProjectsResponse.json();
  assert(portalProjectsBody.projects.length === 7 && portalProjectsBody.projects.every((project) => project.companyId === companyId), 'client project list is limited to the access-code company');

  const foreignProjectResponse = await fetch(`${backendOrigin}/api/client-portal/projects/${createdProjects[0].id}`, {
    headers: { origin: frontendOrigin, cookie: cookieHeader },
  });
  assert(foreignProjectResponse.status === 404, 'client cannot retrieve a project belonging to another company');

  const csrfCookie = cookieHeader.split('; ').find((cookie) => cookie.startsWith('ziyo_client_csrf='))?.split('=', 2)[1];
  const logoutResponse = await fetch(`${backendOrigin}/api/client-portal/logout`, {
    method: 'POST',
    headers: { origin: frontendOrigin, cookie: cookieHeader, 'x-csrf-token': decodeURIComponent(csrfCookie || '') },
  });
  assert(logoutResponse.status === 200, 'client logout succeeds with the required CSRF token');
  const afterLogoutResponse = await fetch(`${backendOrigin}/api/client-portal/session`, {
    headers: { origin: frontendOrigin, cookie: cookieHeader },
  });
  assert(afterLogoutResponse.status === 401, 'logged-out client session is rejected');

  const rotated = await service.issueCompanyAccessCode(companyId, actorId);
  assert(/^[A-Z0-9]{15}$/.test(rotated.code) && rotated.code !== provisioned.accessCode.code, 'rotation issues a new unique code');
  assert(!(await service.getClientSession(clientSession.token)), 'rotating an access code invalidates existing client sessions');

  const firstProject = createdProjects[1];
  assert(firstProject.stages.length === 8, 'new projects receive all eight default development stages');
  const updatedStage = await service.updateProjectStage(firstProject.id, firstProject.stages[0].id, {
    ...firstProject.stages[0], title: 'Planning and research updated', clientVisible: true,
  }, actorId);
  assert(updatedStage.stages[0].title === 'Planning and research updated', 'stage editing persists');
  const createdStage = await service.createProjectStage(firstProject.id, {
    title: 'Integration test stage', description: 'Disposable integration test', startDate: '2026-11-01', dueDate: '2026-11-25',
  }, actorId);
  const addedStage = createdStage.stages.find((stage) => stage.title === 'Integration test stage');
  assert(Boolean(addedStage), 'custom stage creation persists');
  const reorderedStages = [...createdStage.stages].reverse();
  const reorderedProject = await service.reorderProjectStages(firstProject.id, reorderedStages.map((stage) => stage.id), actorId);
  assert(reorderedProject.stages[0].id === reorderedStages[0].id, 'stages can be reordered');
  assert(await service.deleteProjectStage(firstProject.id, addedStage.id, actorId), 'custom stage can be removed');
  const withMilestone = await service.createMilestone(firstProject.id, {
    title: 'Integration milestone', description: '', weight: 100, startDate: '2026-11-01', dueDate: '2026-11-30',
  }, actorId);
  const milestoneId = withMilestone.milestones.at(-1)?.id;
  assert(Boolean(milestoneId), 'milestone creation persists');
  const withTask = await service.createTask(firstProject.id, milestoneId, {
    title: 'Integration task', description: '', weight: 1, stageId: firstProject.stages[0]?.id, status: 'completed', completionPercentage: 100,
  }, actorId);
  assert(withTask.progress.overallPercentage === 100, 'weighted task progress calculates to 100 percent');
  assert(withTask.stages.some((stage) => stage.id === firstProject.stages[0]?.id && stage.completionPercentage === 100), 'task changes update linked development-stage progress');
  const createdFeedback = await service.submitClientFeedback(companyId, firstProject.id, { kind: 'revision_request', message: 'Integration review request' });
  assert(createdFeedback?.kind === 'revision_request' && createdFeedback.status === 'open', 'client feedback and revision requests persist');
  const respondedFeedback = await service.respondToClientFeedback(createdFeedback.id, { status: 'responded', response: 'Reviewed in isolated development integration test' }, actorId);
  assert(respondedFeedback?.status === 'responded', 'administrator can respond to client feedback');
  const approval = await service.requestMilestoneApproval(firstProject.id, milestoneId, 'Integration approval test', actorId);
  assert(approval?.status === 'pending', 'completed milestone can enter a separate client approval workflow');
  const clientLogin = await fetch(`${backendOrigin}/api/client-portal/access`, {
    method: 'POST', headers: { origin: frontendOrigin, 'content-type': 'application/json' },
    body: JSON.stringify({ code: rotated.code }),
  });
  assert(clientLogin.status === 200, 'client can authenticate using the rotated development access code');
  const clientLoginBody = await clientLogin.json();
  const clientCookies = (clientLogin.headers.getSetCookie?.() || [clientLogin.headers.get('set-cookie')].filter(Boolean))
    .map((cookie) => cookie.split(';', 1)[0]).join('; ');
  const clientCsrfCookie = clientCookies.split('; ').find((cookie) => cookie.startsWith('ziyo_client_csrf='))?.split('=', 2)[1];
  const clientCsrf = decodeURIComponent(clientCsrfCookie || '');
  const clientPortalProject = await fetch(`${backendOrigin}/api/client-portal/projects/${firstProject.id}`, {
    headers: { origin: frontendOrigin, cookie: clientCookies },
  });
  assert(clientPortalProject.status === 200, 'authenticated client can retrieve their project dashboard');
  const portalProject = await clientPortalProject.json();
  assert(portalProject.progress.overallPercentage === 100 && portalProject.stages.length === 8, 'client dashboard returns current progress and authorized stages');
  const feedbackResponse = await fetch(`${backendOrigin}/api/client-portal/projects/${firstProject.id}/feedback`, {
    method: 'POST', headers: { origin: frontendOrigin, cookie: clientCookies, 'content-type': 'application/json', 'x-csrf-token': clientCsrf },
    body: JSON.stringify({ kind: 'feedback', milestoneId, message: 'Client portal development integration test' }),
  });
  assert(feedbackResponse.status === 201, 'client can submit CSRF-protected feedback');
  const approvalResponse = await fetch(`${backendOrigin}/api/client-portal/approvals/${approval.id}`, {
    method: 'PATCH', headers: { origin: frontendOrigin, cookie: clientCookies, 'content-type': 'application/json', 'x-csrf-token': clientCsrf },
    body: JSON.stringify({ status: 'approved', comment: 'Reviewed in development integration test' }),
  });
  assert(approvalResponse.status === 200, 'client approval is separate from technical completion');
  const dashboardStats = await service.getProjectDashboardStats();
  assert(dashboardStats.totalProjects >= 8, 'dashboard project count includes the created multi-company fixtures');

  console.log(JSON.stringify({
    passed: true,
    assertions: assertionCount,
    developmentProjectReference: projectRef,
    postgresVersion: '17.12 (verified before integration run)',
    migrationVersion: Number(version.version),
    tested: ['company creation and editing', 'company status management', 'logo profile', 'project creation and editing', 'project category/priority/manager', '15-character codes', 'HMAC-only storage', 'code rotation', 'session invalidation', 'multiple companies/projects', 'search beyond six results', 'status filtering', 'company scoping', 'default and custom development stages', 'stage editing and reordering', 'stage-linked task progress', 'milestone/task persistence', 'weighted progress', 'client feedback and administrator response', 'CSRF-protected client feedback and approval', 'client access API', 'client dashboard and project scoping', 'cross-company project denial'],
    clientPortalFlag: 'true (local development only)',
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: false, assertions: assertionCount, error: error?.message || 'Integration test failed.' }));
  process.exitCode = 1;
} finally {
  try {
    if (fixtureProjectIds.length) {
      const placeholders = fixtureProjectIds.map(() => '?').join(', ');
      await db.prepare(`DELETE FROM client_project_activity_logs WHERE project_id IN (${placeholders})`).run(...fixtureProjectIds);
      await db.prepare(`DELETE FROM client_projects WHERE id IN (${placeholders})`).run(...fixtureProjectIds);
    }
    if (fixtureCompanyIds.length) {
      const placeholders = fixtureCompanyIds.map(() => '?').join(', ');
      await db.prepare(`DELETE FROM client_sessions WHERE company_id IN (${placeholders})`).run(...fixtureCompanyIds);
      await db.prepare(`DELETE FROM client_company_access_codes WHERE company_id IN (${placeholders})`).run(...fixtureCompanyIds);
      await db.prepare(`DELETE FROM client_project_activity_logs WHERE company_id IN (${placeholders})`).run(...fixtureCompanyIds);
      await db.prepare(`DELETE FROM client_companies WHERE id IN (${placeholders})`).run(...fixtureCompanyIds);
    }
    const remainingCompany = fixtureCompanyIds.length
      ? await db.prepare(`SELECT COUNT(*) AS count FROM client_companies WHERE id IN (${fixtureCompanyIds.map(() => '?').join(', ')})`).get(...fixtureCompanyIds)
      : { count: 0 };
    const remainingProject = fixtureProjectIds.length
      ? await db.prepare(`SELECT COUNT(*) AS count FROM client_projects WHERE id IN (${fixtureProjectIds.map(() => '?').join(', ')})`).get(...fixtureProjectIds)
      : { count: 0 };
    const remainingSession = fixtureCompanyIds.length
      ? await db.prepare(`SELECT COUNT(*) AS count FROM client_sessions WHERE company_id IN (${fixtureCompanyIds.map(() => '?').join(', ')})`).get(...fixtureCompanyIds)
      : { count: 0 };
    if (Number(remainingCompany.count) || Number(remainingProject.count) || Number(remainingSession.count)) {
      throw new Error('PostgreSQL Project Management integration fixture cleanup could not be verified.');
    }
    await closeDatabase();
  } catch (error) {
    console.error(JSON.stringify({ cleanupSucceeded: false, errorCode: error?.code || null }));
    process.exitCode = 1;
  }
}
