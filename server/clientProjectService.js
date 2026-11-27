import crypto from 'node:crypto';
import { getDb } from './db.js';
import { deleteProjectMedia, readProjectMedia, storeProjectMedia } from './supabaseProjectStorage.js';

const db = getDb();
const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CLIENT_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const DEFAULT_PROJECT_STAGES = [
  'Planning and research', 'UI/UX design', 'Frontend development', 'Backend development',
  'System integration', 'Testing and quality assurance', 'Deployment', 'Final delivery',
];

function accessPepper() {
  const pepper = process.env.CLIENT_ACCESS_CODE_PEPPER;
  if (typeof pepper !== 'string' || Buffer.byteLength(pepper, 'utf8') < 32) {
    const error = new Error('Client portal access is not configured.');
    error.code = 'CLIENT_ACCESS_NOT_CONFIGURED';
    throw error;
  }
  return pepper;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function accessCodeVerifier(code) {
  return crypto.createHmac('sha256', accessPepper()).update(code).digest('hex');
}

function generateAccessCode() {
  const ceiling = Math.floor(256 / CODE_ALPHABET.length) * CODE_ALPHABET.length;
  let output = '';
  while (output.length < 15) {
    for (const byte of crypto.randomBytes(32)) {
      if (byte >= ceiling) continue;
      output += CODE_ALPHABET[byte % CODE_ALPHABET.length];
      if (output.length === 15) break;
    }
  }
  return output;
}

export function isValidAccessCodeFormat(code) {
  return typeof code === 'string' && /^[A-Z0-9]{10,15}$/i.test(code.trim());
}

export async function consumeClientAccessAttempt(identity) {
  const keyHash = crypto.createHmac('sha256', accessPepper()).update(`client-access-attempt:${String(identity || 'unknown')}`).digest('hex');
  const now = new Date();
  const current = now.toISOString();
  const windowStart = new Date(now.getTime() - 15 * 60_000).toISOString();
  await db.prepare('DELETE FROM client_access_attempt_limits WHERE window_started_at <= ?').run(windowStart);
  const result = await db.prepare(`INSERT INTO client_access_attempt_limits (key_hash, window_started_at, attempt_count)
    VALUES (?, ?, 1)
    ON CONFLICT (key_hash) DO UPDATE SET
      window_started_at = CASE WHEN client_access_attempt_limits.window_started_at <= ? THEN ? ELSE client_access_attempt_limits.window_started_at END,
      attempt_count = CASE WHEN client_access_attempt_limits.window_started_at <= ? THEN 1 ELSE client_access_attempt_limits.attempt_count + 1 END
    RETURNING attempt_count AS attemptCount`).get(keyHash, current, windowStart, current, windowStart);
  return Number(result?.attemptCount || 0) <= 8;
}

export function calculateWeightedProgress(items) {
  const valid = (Array.isArray(items) ? items : []).filter((item) =>
    Number.isFinite(Number(item?.weight)) && Number(item.weight) > 0 && Number.isFinite(Number(item?.completionPercentage)));
  const totalWeight = valid.reduce((sum, item) => sum + Number(item.weight), 0);
  if (!totalWeight) return 0;
  const weighted = valid.reduce((sum, item) => sum + Number(item.weight) * Math.max(0, Math.min(100, Number(item.completionPercentage))), 0);
  return Math.round((weighted / totalWeight) * 10) / 10;
}

function normalizeTask(task) {
  return {
    ...task,
    weight: Number(task.weight),
    completionPercentage: task.status === 'completed' ? 100 : Number(task.completion_percentage || 0),
  };
}

function milestoneCompletion(milestone, tasks) {
  const children = tasks.filter((task) => task.milestone_id === milestone.id).map(normalizeTask);
  if (children.length) return calculateWeightedProgress(children);
  return 0;
}

function milestoneStatus(milestone, tasks, now = new Date()) {
  const children = tasks.filter((task) => task.milestone_id === milestone.id);
  const completion = milestoneCompletion(milestone, tasks);
  if (completion >= 100) return 'completed';
  if (children.some((task) => task.status === 'blocked')) return 'blocked';
  const dueDate = milestone.due_date ?? milestone.dueDate;
  if (dueDate && new Date(`${dueDate}T23:59:59Z`) < now) return 'delayed';
  if (completion > 0 || children.some((task) => task.status === 'in_progress')) return 'in_progress';
  return 'upcoming';
}

async function logActivity({ companyId, projectId, actorId, eventType, entityType, entityId, metadata = {}, clientVisible = false }) {
  await db.prepare(`INSERT INTO client_project_activity_logs
    (id, company_id, project_id, actor_id, actor_type, event_type, entity_type, entity_id, metadata, client_visible)
    VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?, ?)`)
    .run(crypto.randomUUID(), companyId, projectId || null, actorId, eventType, entityType, entityId || null, JSON.stringify(metadata), clientVisible);
}

function companyDate(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

async function createDefaultStages(projectId, startDate) {
  for (const [index, title] of DEFAULT_PROJECT_STAGES.entries()) {
    await db.prepare(`INSERT INTO client_project_stages (id, project_id, title, stage_order, status, start_date)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(crypto.randomUUID(), projectId, title, index + 1, index === 0 ? 'in_progress' : 'upcoming', startDate || null);
  }
}

async function stageBelongsToProject(stageId, projectId) {
  if (!stageId) return true;
  return Boolean(await db.prepare('SELECT id FROM client_project_stages WHERE id = ? AND project_id = ?').get(stageId, projectId));
}

export async function syncProjectStages(projectId) {
  const stages = await db.prepare('SELECT id, status, completion_percentage AS completionPercentage FROM client_project_stages WHERE project_id = ? ORDER BY stage_order').all(projectId);
  for (const stage of stages) {
    const tasks = await db.prepare('SELECT weight, status, completion_percentage AS completionPercentage FROM client_project_tasks WHERE stage_id = ?').all(stage.id);
    if (!tasks.length) continue;
    const completion = calculateWeightedProgress(tasks.map((task) => ({ ...task, completionPercentage: task.status === 'completed' ? 100 : Number(task.completionPercentage) })));
    const status = completion >= 100 ? 'completed' : tasks.some((task) => task.status === 'blocked') ? 'blocked' : completion > 0 || tasks.some((task) => task.status === 'in_progress') ? 'in_progress' : 'upcoming';
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    await db.prepare(`UPDATE client_project_stages SET completion_percentage = ?, status = ?,
      completed_at = CASE WHEN ? = 'completed' THEN COALESCE(completed_at, ?) ELSE NULL END,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(completion, status, status, completedAt, stage.id);
    if (stage.status !== 'completed' && status === 'completed') {
      const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
      await logActivity({ companyId: project.companyId, projectId, eventType: 'development_stage_completed', entityType: 'stage', entityId: stage.id, clientVisible: true });
    }
  }
  return db.prepare(`SELECT id, project_id AS projectId, title, description, stage_order AS stageOrder, status,
    start_date AS startDate, due_date AS dueDate, completion_percentage AS completionPercentage,
    completed_at AS completedAt FROM client_project_stages WHERE project_id = ? ORDER BY stage_order`).all(projectId);
}

export async function recordProgressSnapshot(projectId, source = 'project_update') {
  const project = await db.prepare('SELECT id FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return null;
  const tasks = await db.prepare('SELECT weight, status, completion_percentage FROM client_project_tasks WHERE project_id = ?').all(projectId);
  const milestones = await db.prepare('SELECT id, weight, due_date FROM client_project_milestones WHERE project_id = ?').all(projectId);
  const actual = tasks.length
    ? calculateWeightedProgress(tasks.map(normalizeTask))
    : calculateWeightedProgress(milestones.map((milestone) => ({ weight: milestone.weight, completionPercentage: 0 })));
  const totalMilestoneWeight = milestones.reduce((sum, milestone) => sum + Number(milestone.weight || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const planned = totalMilestoneWeight
    ? Math.round((milestones.reduce((sum, milestone) => sum + (milestone.due_date && milestone.due_date <= today ? Number(milestone.weight) : 0), 0) / totalMilestoneWeight) * 1000) / 10
    : 0;
  const previous = await db.prepare(`SELECT planned_percentage AS plannedPercentage, actual_percentage AS actualPercentage
    FROM client_project_progress_history WHERE project_id = ? ORDER BY recorded_at DESC LIMIT 1`).get(projectId);
  if (previous && Number(previous.plannedPercentage) === planned && Number(previous.actualPercentage) === actual) {
    return { plannedPercentage: planned, actualPercentage: actual, unchanged: true };
  }
  await db.prepare(`INSERT INTO client_project_progress_history
    (id, project_id, planned_percentage, actual_percentage, source) VALUES (?, ?, ?, ?, ?)`)
    .run(crypto.randomUUID(), projectId, planned, actual, source);
  return { plannedPercentage: planned, actualPercentage: actual };
}

export async function createCompany(data, actorId) {
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO client_companies
    (id, company_name, contact_person, email, phone, description, website, industry, internal_notes, logo_url, status, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`)
    .run(id, data.companyName, data.contactPerson || '', data.email || '', data.phone || '', data.description || '', data.website || '', data.industry || '', data.internalNotes || '', data.logoUrl || '', actorId, actorId);
  await logActivity({ companyId: id, actorId, eventType: 'company_created', entityType: 'company', entityId: id });
  return getCompany(id);
}

export async function createCompanyWithAccessCode(data, actorId) {
  accessPepper();
  return db.transaction(async () => {
    const company = await createCompany(data, actorId);
    const accessCode = await issueCompanyAccessCode(company.id, actorId);
    const initialProject = data.initialProject?.title
      ? await createProject({ ...data.initialProject, companyId: company.id }, actorId)
      : null;
    return { company: await getCompany(company.id), accessCode, initialProject };
  })();
}

export async function updateCompany(companyId, data, actorId) {
  const result = await db.prepare(`UPDATE client_companies SET company_name = ?, contact_person = ?, email = ?, phone = ?,
    description = ?, website = ?, industry = ?, internal_notes = ?, logo_url = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(data.companyName, data.contactPerson || '', data.email || '', data.phone || '', data.description || '', data.website || '', data.industry || '', data.internalNotes || '', data.logoUrl || '', actorId, companyId);
  if (!result.changes) return null;
  await logActivity({ companyId, actorId, eventType: 'company_updated', entityType: 'company', entityId: companyId });
  return getCompany(companyId);
}

export async function getCompany(companyId) {
  return await db.prepare(`SELECT id, company_name AS companyName, contact_person AS contactPerson, email, phone,
    description, website, industry, internal_notes AS internalNotes, logo_url AS logoUrl, status, created_at AS createdAt,
    updated_at AS updatedAt FROM client_companies WHERE id = ?`).get(companyId) || null;
}

export async function listCompanies({ search = '', limit = null } = {}) {
  const query = String(search || '').trim();
  const hasSearch = query.length > 0;
  const cap = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Math.min(100, Number(limit)) : null;
  const position = db.dialect === 'postgres'
    ? 'POSITION(LOWER(?) IN LOWER(c.company_name))'
    : 'INSTR(LOWER(c.company_name), LOWER(?))';
  const projectPosition = db.dialect === 'postgres'
    ? 'POSITION(LOWER(?) IN LOWER(p.title))'
    : 'INSTR(LOWER(p.title), LOWER(?))';
  const where = hasSearch ? `WHERE ${position} > 0 OR EXISTS (SELECT 1 FROM client_projects p WHERE p.company_id = c.id AND ${projectPosition} > 0)` : '';
  const order = hasSearch
    ? `CASE WHEN LOWER(TRIM(c.company_name)) = LOWER(?) THEN 0
         WHEN ${position} = 1 THEN 1
         WHEN ${db.dialect === 'postgres' ? "POSITION(' ' || LOWER(?) IN LOWER(c.company_name))" : "INSTR(LOWER(c.company_name), ' ' || LOWER(?))"} > 0 THEN 2 ELSE 3 END,
       ${position}, LENGTH(c.company_name), c.created_at DESC`
    : 'c.created_at DESC';
  const params = hasSearch ? [query, query, query, query, query, query] : [];
  const limitSql = cap ? ' LIMIT ?' : '';
  if (cap) params.push(cap);
  const companies = await db.prepare(`SELECT c.id, c.company_name AS companyName, c.contact_person AS contactPerson,
    c.email, c.phone, c.description, c.website, c.industry, c.internal_notes AS internalNotes, c.status,
    c.created_at AS createdAt, c.updated_at AS updatedAt,
    (SELECT COUNT(*) FROM client_company_access_codes a WHERE a.company_id = c.id AND a.status = 'active' AND (a.expires_at IS NULL OR a.expires_at > ?)) AS hasActiveCode
    FROM client_companies c ${where} ORDER BY ${order}${limitSql}`)
    .all(...(hasSearch ? [...params.slice(0, 0), new Date().toISOString(), ...params] : [new Date().toISOString(), ...params]));
  const projectNames = await db.prepare('SELECT company_id AS companyId, title, status FROM client_projects ORDER BY created_at DESC').all();
  const projectNamesByCompany = new Map();
  const projectStatusesByCompany = new Map();
  for (const project of projectNames) {
    const names = projectNamesByCompany.get(project.companyId) || [];
    names.push(project.title);
    projectNamesByCompany.set(project.companyId, names);
    const statuses = projectStatusesByCompany.get(project.companyId) || [];
    statuses.push(project.status);
    projectStatusesByCompany.set(project.companyId, statuses);
  }
  const summaries = await db.prepare(`SELECT p.company_id AS companyId, COUNT(*) AS projectCount,
    SUM(CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressProjects,
    SUM(CASE WHEN p.status = 'blocked' THEN 1 ELSE 0 END) AS blockedProjects,
    SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completedProjects,
    AVG(COALESCE((SELECT h.actual_percentage FROM client_project_progress_history h
      WHERE h.project_id = p.id ORDER BY h.recorded_at DESC LIMIT 1), 0)) AS averageProgress
    FROM client_projects p GROUP BY p.company_id`).all();
  const summaryByCompany = new Map(summaries.map((summary) => [summary.companyId, summary]));
  return companies.map((company) => {
    const summary = summaryByCompany.get(company.id);
    return {
      ...company,
      projectNames: projectNamesByCompany.get(company.id) || [],
      projectStatuses: projectStatusesByCompany.get(company.id) || [],
      projectCount: Number(summary?.projectCount || 0),
      inProgressProjects: Number(summary?.inProgressProjects || 0),
      blockedProjects: Number(summary?.blockedProjects || 0),
      completedProjects: Number(summary?.completedProjects || 0),
      averageProgress: Math.round(Number(summary?.averageProgress || 0) * 10) / 10,
      hasActiveCode: Number(company.hasActiveCode) > 0,
    };
  });
}

export async function setCompanyStatus(companyId, status, actorId) {
  return db.transaction(async () => {
    const result = await db.prepare('UPDATE client_companies SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, actorId, companyId);
    if (!result.changes) return false;
    if (status !== 'active') {
      const now = new Date().toISOString();
      await db.prepare(`UPDATE client_company_access_codes SET status = 'revoked', revoked_by = ?, revoked_at = ?
        WHERE company_id = ? AND status = 'active'`).run(actorId, now, companyId);
      await db.prepare('UPDATE client_sessions SET revoked_at = ? WHERE company_id = ? AND revoked_at IS NULL').run(now, companyId);
    }
    await logActivity({ companyId, actorId, eventType: status === 'active' ? 'company_activated' : 'company_deactivated', entityType: 'company', entityId: companyId });
    return true;
  })();
}

export async function issueCompanyAccessCode(companyId, actorId, expiresAt = null) {
  accessPepper();
  if (expiresAt !== null) {
    const expiration = Date.parse(expiresAt);
    if (!Number.isFinite(expiration) || expiration <= Date.now() || expiration > Date.now() + 366 * 24 * 60 * 60 * 1000) throw new Error('Invalid access-code expiration.');
    expiresAt = new Date(expiration).toISOString();
  }
  return db.transaction(async () => {
    const company = await db.prepare("SELECT id FROM client_companies WHERE id = ? AND status = 'active'").get(companyId);
    if (!company) return null;
    const now = new Date().toISOString();
    await db.prepare(`UPDATE client_company_access_codes SET status = 'revoked', revoked_by = ?, revoked_at = ?
      WHERE company_id = ? AND status = 'active'`).run(actorId, now, companyId);
    await db.prepare('UPDATE client_sessions SET revoked_at = ? WHERE company_id = ? AND revoked_at IS NULL').run(now, companyId);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const code = generateAccessCode();
      const verifierHash = accessCodeVerifier(code);
      const collision = await db.prepare('SELECT id FROM client_company_access_codes WHERE verifier_hash = ?').get(verifierHash);
      if (collision) continue;
      await db.prepare(`INSERT INTO client_company_access_codes (id, company_id, verifier_hash, issued_by, expires_at)
        VALUES (?, ?, ?, ?, ?)`)
        .run(crypto.randomUUID(), companyId, verifierHash, actorId, expiresAt);
      await logActivity({ companyId, actorId, eventType: 'access_code_issued', entityType: 'access_code' });
      return { code, issuedAt: now, expiresAt };
    }
    throw new Error('Unable to generate a unique access code.');
  })();
}

export async function revokeCompanyAccessCode(companyId, actorId) {
  return db.transaction(async () => {
    const now = new Date().toISOString();
    const result = await db.prepare(`UPDATE client_company_access_codes SET status = 'revoked', revoked_by = ?, revoked_at = ?
      WHERE company_id = ? AND status = 'active'`).run(actorId, now, companyId);
    await db.prepare('UPDATE client_sessions SET revoked_at = ? WHERE company_id = ? AND revoked_at IS NULL').run(now, companyId);
    if (result.changes) await logActivity({ companyId, actorId, eventType: 'access_code_revoked', entityType: 'access_code' });
    return result.changes > 0;
  })();
}

export async function findCompanyForAccessCode(code) {
  if (!isValidAccessCodeFormat(code)) return null;
  const verifierHash = accessCodeVerifier(code.trim().toUpperCase());
  const now = new Date().toISOString();
  return await db.prepare(`SELECT c.id, c.company_name AS companyName FROM client_company_access_codes a
    JOIN client_companies c ON c.id = a.company_id
    WHERE a.verifier_hash = ? AND a.status = 'active' AND (a.expires_at IS NULL OR a.expires_at > ?) AND c.status = 'active'`).get(verifierHash, now) || null;
}

export async function createClientSessionForAccessCode(code) {
  if (!isValidAccessCodeFormat(code)) return null;
  const verifierHash = accessCodeVerifier(code.trim().toUpperCase());
  const now = new Date().toISOString();
  return db.transaction(async () => {
    const company = await db.prepare(`SELECT c.id, c.company_name AS companyName FROM client_company_access_codes a
      JOIN client_companies c ON c.id = a.company_id
      WHERE a.verifier_hash = ? AND a.status = 'active' AND (a.expires_at IS NULL OR a.expires_at > ?) AND c.status = 'active'`).get(verifierHash, now);
    if (!company) return null;
    const token = crypto.randomBytes(32).toString('base64url');
    const csrfToken = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + CLIENT_SESSION_TTL_MS).toISOString();
    await db.prepare(`INSERT INTO client_sessions (token_hash, company_id, csrf_hash, expires_at)
      VALUES (?, ?, ?, ?)`).run(sha256(token), company.id, sha256(csrfToken), expiresAt);
    await db.prepare(`INSERT INTO client_project_activity_logs (id, company_id, actor_type, event_type, entity_type)
      VALUES (?, ?, 'client', 'client_portal_access', 'company')`).run(crypto.randomUUID(), company.id);
    return { companyId: company.id, companyName: company.companyName, token, csrfToken, expiresAt };
  })();
}

export async function createClientSession(companyId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrfToken = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + CLIENT_SESSION_TTL_MS).toISOString();
  await db.prepare(`INSERT INTO client_sessions (token_hash, company_id, csrf_hash, expires_at)
    VALUES (?, ?, ?, ?)`).run(sha256(token), companyId, sha256(csrfToken), expiresAt);
  return { token, csrfToken, expiresAt };
}

export async function getClientSession(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const session = await db.prepare(`SELECT s.token_hash, s.csrf_hash AS csrfHash, s.company_id AS companyId,
    c.company_name AS companyName, s.expires_at AS expiresAt FROM client_sessions s JOIN client_companies c ON c.id = s.company_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND c.status = 'active'`)
    .get(sha256(token), new Date().toISOString());
  if (!session) return null;
  await db.prepare('UPDATE client_sessions SET last_seen_at = ? WHERE token_hash = ?').run(new Date().toISOString(), session.token_hash);
  return session;
}

export function verifyClientCsrf(session, token) {
  if (!session || typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return false;
  const expected = Buffer.from(session.csrfHash, 'hex');
  const supplied = Buffer.from(sha256(token), 'hex');
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export async function revokeClientSession(token) {
  if (typeof token !== 'string') return;
  await db.prepare('UPDATE client_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL')
    .run(new Date().toISOString(), sha256(token));
}

export async function listAdminProjects() {
  return db.prepare(`SELECT p.id, p.company_id AS companyId, c.company_name AS companyName, c.logo_url AS companyLogoUrl,
    p.title, p.description, p.category, p.priority, p.assigned_manager_id AS assignedManagerId,
    COALESCE(NULLIF(manager.full_name, ''), manager.email, '') AS assignedManagerName,
    p.status, p.start_date AS startDate, p.target_completion_date AS targetCompletionDate,
    p.estimated_completion_date AS estimatedCompletionDate, p.actual_completion_date AS actualCompletionDate,
    p.created_at AS createdAt, p.updated_at AS updatedAt FROM client_projects p JOIN client_companies c ON c.id = p.company_id
    LEFT JOIN user_accounts manager ON manager.id = p.assigned_manager_id
    ORDER BY p.created_at DESC`).all();
}

export async function listProjectManagers() {
  return db.prepare(`SELECT id, full_name AS fullName, email FROM user_accounts
    WHERE role = 'admin' AND account_status = 'ACTIVE' AND email_verified = 1
    ORDER BY LOWER(full_name), LOWER(email)`).all();
}

export async function isAssignableProjectManager(managerId) {
  if (!managerId) return false;
  return Boolean(await db.prepare(`SELECT id FROM user_accounts
    WHERE id = ? AND role = 'admin' AND account_status = 'ACTIVE' AND email_verified = 1`).get(managerId));
}

export async function getProjectDashboardStats() {
  const row = await db.prepare(`SELECT COUNT(*) AS totalProjects,
    SUM(CASE WHEN status IN ('planning','in_progress','under_review','blocked','delayed','on_hold') THEN 1 ELSE 0 END) AS activeProjects,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedProjects,
    SUM(CASE WHEN status NOT IN ('completed','cancelled') AND target_completion_date < CURRENT_DATE THEN 1 ELSE 0 END) AS overdueProjects
    FROM client_projects`).get();
  return Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [key, Number(value || 0)]));
}

export async function searchAdminProjects({ search = '', status = '', limit = 6 } = {}) {
  const query = String(search || '').trim().slice(0, 160);
  const statusFilter = String(status || '').trim();
  const cap = Math.max(1, Math.min(6, Number.parseInt(String(limit), 10) || 6));
  const position = db.dialect === 'postgres'
    ? 'POSITION(LOWER(?) IN LOWER(p.title))'
    : 'INSTR(LOWER(p.title), LOWER(?))';
  const summaries = await db.prepare(`SELECT p.id, p.company_id AS companyId, c.company_name AS companyName,
    c.logo_url AS companyLogoUrl, p.title, p.category, p.priority, p.status, p.start_date AS startDate,
    p.target_completion_date AS targetCompletionDate, p.estimated_completion_date AS estimatedCompletionDate,
    p.assigned_manager_id AS assignedManagerId,
    COALESCE(NULLIF(manager.full_name, ''), manager.email, '') AS assignedManagerName,
    p.created_at AS createdAt
    FROM client_projects p JOIN client_companies c ON c.id = p.company_id
    LEFT JOIN user_accounts manager ON manager.id = p.assigned_manager_id
    WHERE (? = '' OR ${position} > 0) AND (? = '' OR p.status = ?)
    ORDER BY CASE WHEN ? = '' THEN 0 WHEN LOWER(p.title) = LOWER(?) THEN 0
      WHEN SUBSTR(LOWER(p.title), 1, LENGTH(?)) = LOWER(?) THEN 1 ELSE 2 END,
      p.created_at DESC, p.id
    LIMIT ?`).all(query, query, statusFilter, statusFilter, query, query, query, query, cap);
  const projects = await Promise.all(summaries.map(async (summary) => {
    const project = await getAdminProject(summary.id);
    return project ? { ...summary, ...project } : null;
  }));
  return projects.filter(Boolean);
}

export async function createProject(data, actorId) {
  const company = await db.prepare("SELECT id, created_at AS createdAt FROM client_companies WHERE id = ? AND status = 'active'").get(data.companyId);
  if (!company) return null;
  if (data.assignedManagerId && !await isAssignableProjectManager(data.assignedManagerId)) throw new Error('Invalid project manager.');
  const id = crypto.randomUUID();
  const startDate = companyDate(company.createdAt);
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_projects (id, company_id, title, description, scope, status, start_date,
      target_completion_date, estimated_completion_date, assigned_manager_id, category, priority, impact, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, data.companyId, data.title, data.description || '', data.scope || '', data.status || 'planning', startDate,
        data.targetCompletionDate || null, data.estimatedCompletionDate || null, data.assignedManagerId || null, data.category || 'general', data.priority || 'normal', data.impact || 'standard', actorId, actorId);
    await createDefaultStages(id, startDate);
    await logActivity({ companyId: data.companyId, projectId: id, actorId, eventType: 'project_created', entityType: 'project', entityId: id });
    await recordProgressSnapshot(id, 'project_created');
  })();
  return getAdminProject(id);
}

export async function updateProject(projectId, data, actorId) {
  const existing = await db.prepare(`SELECT p.company_id AS companyId, p.status, c.created_at AS companyCreatedAt
    FROM client_projects p JOIN client_companies c ON c.id = p.company_id WHERE p.id = ?`).get(projectId);
  if (!existing) return null;
  if (data.assignedManagerId && !await isAssignableProjectManager(data.assignedManagerId)) throw new Error('Invalid project manager.');
  await db.transaction(async () => {
    await db.prepare(`UPDATE client_projects SET title = ?, description = ?, scope = ?, status = ?, start_date = ?,
      target_completion_date = ?, estimated_completion_date = ?, actual_completion_date = ?, assigned_manager_id = ?, category = ?, priority = ?, impact = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`).run(data.title, data.description || '', data.scope || '', data.status, data.startDate || null, data.targetCompletionDate || null,
      data.estimatedCompletionDate || null, data.actualCompletionDate || null, data.assignedManagerId || null, data.category || 'general', data.priority || 'normal', data.impact || 'standard', actorId, projectId);
    await db.prepare('UPDATE client_projects SET start_date = ? WHERE id = ?').run(companyDate(existing.companyCreatedAt), projectId);
    const statusChanged = existing.status !== data.status;
    await logActivity({ companyId: existing.companyId, projectId, actorId, eventType: statusChanged ? 'project_status_changed' : 'project_updated', entityType: 'project', entityId: projectId, clientVisible: statusChanged });
    await recordProgressSnapshot(projectId, 'project_updated');
  })();
  return getAdminProject(projectId);
}

export async function createMilestone(projectId, data, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return null;
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_milestones (id, project_id, title, description, weight, start_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, projectId, data.title, data.description || '', data.weight, data.startDate || null, data.dueDate || null);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'milestone_created', entityType: 'milestone', entityId: id });
    await recordProgressSnapshot(projectId, 'milestone_created');
  })();
  return getAdminProject(projectId);
}

export async function updateMilestone(projectId, milestoneId, data, actorId) {
  const milestone = await db.prepare('SELECT id FROM client_project_milestones WHERE id = ? AND project_id = ?').get(milestoneId, projectId);
  if (!milestone) return null;
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  await db.transaction(async () => {
    await db.prepare(`UPDATE client_project_milestones SET title = ?, description = ?, weight = ?, start_date = ?, due_date = ?, client_visible = ?,
      updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`)
      .run(data.title, data.description || '', data.weight, data.startDate || null, data.dueDate || null, data.clientVisible !== false, milestoneId, projectId);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'milestone_updated', entityType: 'milestone', entityId: milestoneId });
    await recordProgressSnapshot(projectId, 'milestone_updated');
  })();
  return getAdminProject(projectId);
}

export async function createTask(projectId, milestoneId, data, actorId) {
  const milestone = await db.prepare(`SELECT m.id, p.company_id AS companyId FROM client_project_milestones m
    JOIN client_projects p ON p.id = m.project_id WHERE m.id = ? AND m.project_id = ?`).get(milestoneId, projectId);
  if (!milestone) return null;
  if (data.stageId && !await stageBelongsToProject(data.stageId, projectId)) throw new Error('Choose a development stage belonging to this project.');
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_tasks (id, project_id, milestone_id, stage_id, title, description, weight,
      status, completion_percentage, due_date, development_notes, blocker, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, projectId, milestoneId, data.stageId || null, data.title, data.description || '', data.weight, data.status || 'upcoming',
        data.status === 'completed' ? 100 : data.status === 'upcoming' ? 0 : Number(data.completionPercentage || 0), data.dueDate || null,
        data.developmentNotes || '', data.blocker || '', data.status === 'completed' ? new Date().toISOString() : null);
    await logActivity({ companyId: milestone.companyId, projectId, actorId, eventType: 'task_created', entityType: 'task', entityId: id });
    await syncProjectStages(projectId);
    await recordProgressSnapshot(projectId, 'task_created');
  })();
  return getAdminProject(projectId);
}

export async function updateTask(projectId, taskId, data, actorId) {
  const task = await db.prepare(`SELECT t.id, t.milestone_id AS milestoneId, t.stage_id AS stageId, p.company_id AS companyId FROM client_project_tasks t
    JOIN client_projects p ON p.id = t.project_id WHERE t.id = ? AND t.project_id = ?`).get(taskId, projectId);
  if (!task) return null;
  const beforeProject = await getAdminProject(projectId);
  const previousMilestoneStatus = beforeProject?.milestones.find((milestone) => milestone.id === task.milestoneId)?.status;
  const stageId = data.stageId === undefined ? task.stageId : data.stageId || null;
  if (stageId && !await stageBelongsToProject(stageId, projectId)) throw new Error('Choose a development stage belonging to this project.');
  const completion = data.status === 'completed' ? 100 : data.status === 'upcoming' ? 0 : Number(data.completionPercentage || 0);
  await db.transaction(async () => {
    await db.prepare(`UPDATE client_project_tasks SET title = ?, description = ?, weight = ?, status = ?, stage_id = ?,
      completion_percentage = ?, due_date = ?, development_notes = ?, blocker = ?,
      completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`)
      .run(data.title, data.description || '', data.weight, data.status, stageId, completion, data.dueDate || null,
        data.developmentNotes || '', data.blocker || '', data.status === 'completed' ? new Date().toISOString() : null, taskId, projectId);
    await logActivity({ companyId: task.companyId, projectId, actorId, eventType: 'task_updated', entityType: 'task', entityId: taskId });
    await syncProjectStages(projectId);
    await recordProgressSnapshot(projectId, 'task_updated');
  })();
  const updated = await getAdminProject(projectId);
  const completedMilestone = updated?.milestones.find((milestone) => milestone.id === task.milestoneId);
  if (previousMilestoneStatus !== 'completed' && completedMilestone?.status === 'completed' && completedMilestone.clientVisible !== false) {
    await db.prepare(`INSERT INTO client_project_updates (id, project_id, author_id, title, body, client_visible)
      SELECT ?, ?, ?, ?, ?, TRUE`).run(crypto.randomUUID(), projectId, actorId, 'Milestone completed', 'A project milestone has been completed.');
    await logActivity({ companyId: task.companyId, projectId, actorId, eventType: 'milestone_completed', entityType: 'milestone', entityId: task.milestoneId, clientVisible: true });
  }
  return updated;
}

export async function createProjectUpdate(projectId, { title, body, stageId = null, clientVisible = true, resourceIds = [] }, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return null;
  if (stageId && !await stageBelongsToProject(stageId, projectId)) throw new Error('Choose a development stage belonging to this project.');
  const ids = [...new Set(Array.isArray(resourceIds) ? resourceIds.filter((value) => typeof value === 'string') : [])].slice(0, 8);
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_updates (id, project_id, author_id, title, body, stage_id, client_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, projectId, actorId, title, body, stageId, Boolean(clientVisible));
    for (const resourceId of ids) {
      const resource = await db.prepare(`SELECT id FROM client_project_resources WHERE id = ? AND project_id = ?
        AND (? = FALSE OR visibility = 'client')`).get(resourceId, projectId, Boolean(clientVisible));
      if (!resource) throw new Error('Updates can only include resources from this project that are visible to the client.');
      await db.prepare('INSERT INTO client_project_update_resources (update_id, resource_id) VALUES (?, ?)').run(id, resourceId);
    }
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'project_update_published', entityType: 'update', entityId: id, clientVisible: Boolean(clientVisible) });
    await recordProgressSnapshot(projectId, 'project_update');
  })();
  return getAdminProject(projectId);
}

export async function createProjectStage(projectId, data, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return null;
  const order = Number((await db.prepare('SELECT COALESCE(MAX(stage_order), 0) AS maxOrder FROM client_project_stages WHERE project_id = ?').get(projectId))?.maxOrder || 0) + 1;
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_stages (id, project_id, title, description, stage_order, status, start_date, due_date, client_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, projectId, data.title, data.description || '', order, data.status || 'upcoming', data.startDate || null, data.dueDate || null, data.clientVisible !== false);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'development_stage_created', entityType: 'stage', entityId: id });
  })();
  return getAdminProject(projectId);
}

export async function updateProjectStage(projectId, stageId, data, actorId) {
  const stage = await db.prepare(`SELECT id, status FROM client_project_stages WHERE id = ? AND project_id = ?`).get(stageId, projectId);
  if (!stage) return null;
  await db.transaction(async () => {
    await db.prepare(`UPDATE client_project_stages SET title = ?, description = ?, status = ?, start_date = ?, due_date = ?, client_visible = ?,
      completion_percentage = ?, completed_at = CASE WHEN ? = 'completed' THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END,
      updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`)
      .run(data.title, data.description || '', data.status, data.startDate || null, data.dueDate || null, data.clientVisible !== false,
        Number(data.completionPercentage || 0), data.status, stageId, projectId);
    if (stage.status !== 'completed' && data.status === 'completed') {
      await db.prepare(`INSERT INTO client_project_updates (id, project_id, author_id, title, body, stage_id, client_visible)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)`)
        .run(crypto.randomUUID(), projectId, actorId, 'Development stage completed', 'A development stage has been completed.', stageId);
      await logActivity({ companyId: (await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId)).companyId, projectId, actorId, eventType: 'development_stage_completed', entityType: 'stage', entityId: stageId, clientVisible: true });
    }
  })();
  await syncProjectStages(projectId);
  return getAdminProject(projectId);
}

export async function reorderProjectStages(projectId, orderedIds, actorId) {
  const current = await db.prepare('SELECT id FROM client_project_stages WHERE project_id = ? ORDER BY stage_order').all(projectId);
  const ids = Array.isArray(orderedIds) ? orderedIds : [];
  if (ids.length !== current.length || new Set(ids).size !== current.length || current.some((stage) => !ids.includes(stage.id))) return null;
  await db.transaction(async () => {
    for (const [index, id] of ids.entries()) {
      await db.prepare('UPDATE client_project_stages SET stage_order = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND id = ?').run(index + 1, projectId, id);
    }
    const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'development_stages_reordered', entityType: 'project', entityId: projectId });
  })();
  return getAdminProject(projectId);
}

export async function deleteProjectStage(projectId, stageId, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return false;
  const result = await db.prepare('DELETE FROM client_project_stages WHERE project_id = ? AND id = ?').run(projectId, stageId);
  if (!result.changes) return false;
  await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'development_stage_removed', entityType: 'stage', entityId: stageId });
  return true;
}

export async function submitClientFeedback(companyId, projectId, { milestoneId = null, kind = 'feedback', message }) {
  const project = await db.prepare('SELECT id FROM client_projects WHERE id = ? AND company_id = ?').get(projectId, companyId);
  if (!project) return null;
  if (milestoneId && !await db.prepare('SELECT id FROM client_project_milestones WHERE id = ? AND project_id = ?').get(milestoneId, projectId)) return null;
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_feedback (id, company_id, project_id, milestone_id, kind, message)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, companyId, projectId, milestoneId, kind, message.trim());
    await db.prepare(`INSERT INTO client_project_activity_logs (id, company_id, project_id, actor_type, event_type, entity_type, entity_id, client_visible)
      VALUES (?, ?, ?, 'client', ?, 'feedback', ?, FALSE)`)
      .run(crypto.randomUUID(), companyId, projectId, kind === 'revision_request' ? 'client_revision_requested' : 'client_feedback_submitted', id);
  })();
  return db.prepare(`SELECT id, project_id AS projectId, milestone_id AS milestoneId, kind, message, status,
    admin_response AS adminResponse, responded_at AS respondedAt, created_at AS createdAt FROM client_project_feedback WHERE id = ?`).get(id);
}

export async function respondToClientFeedback(feedbackId, { status, response }, actorId) {
  const updated = await db.prepare(`UPDATE client_project_feedback SET status = ?, admin_response = ?, responded_by = ?,
    responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id, project_id AS projectId, company_id AS companyId`)
    .get(status, response.trim(), actorId, feedbackId);
  if (!updated) return null;
  await logActivity({ companyId: updated.companyId, projectId: updated.projectId, actorId, eventType: 'client_feedback_reviewed', entityType: 'feedback', entityId: updated.id });
  return db.prepare(`SELECT id, project_id AS projectId, milestone_id AS milestoneId, kind, message, status,
    admin_response AS adminResponse, responded_at AS respondedAt, created_at AS createdAt FROM client_project_feedback WHERE id = ?`).get(feedbackId);
}

export async function requestMilestoneApproval(projectId, milestoneId, requestNote, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  const milestone = await db.prepare('SELECT id FROM client_project_milestones WHERE id = ? AND project_id = ?').get(milestoneId, projectId);
  if (!project || !milestone) return null;
  const existing = await db.prepare(`SELECT id FROM client_project_milestone_approvals WHERE milestone_id = ? AND status = 'pending'`).get(milestoneId);
  if (existing) return db.prepare('SELECT * FROM client_project_milestone_approvals WHERE id = ?').get(existing.id);
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO client_project_milestone_approvals (id, company_id, project_id, milestone_id, requested_by, request_note)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, project.companyId, projectId, milestoneId, actorId, requestNote.trim());
  await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'milestone_approval_requested', entityType: 'milestone', entityId: milestoneId, clientVisible: true });
  return db.prepare(`SELECT id, company_id AS companyId, project_id AS projectId, milestone_id AS milestoneId,
    request_note AS requestNote, status, client_comment AS clientComment, requested_at AS requestedAt,
    resolved_at AS resolvedAt FROM client_project_milestone_approvals WHERE id = ?`).get(id);
}

export async function resolveMilestoneApproval(companyId, approvalId, { status, comment }) {
  const updated = await db.prepare(`UPDATE client_project_milestone_approvals SET status = ?, client_comment = ?, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ? AND company_id = ? AND status = 'pending' RETURNING id, project_id AS projectId, milestone_id AS milestoneId`)
    .get(status, comment.trim(), approvalId, companyId);
  if (!updated) return null;
  await db.prepare(`INSERT INTO client_project_activity_logs (id, company_id, project_id, actor_type, event_type, entity_type, entity_id, client_visible)
    VALUES (?, ?, ?, 'client', ?, 'approval', ?, TRUE)`)
    .run(crypto.randomUUID(), companyId, updated.projectId, status === 'approved' ? 'milestone_approved_by_client' : 'milestone_changes_requested', updated.id);
  return updated;
}

export async function cancelMilestoneApproval(approvalId, actorId) {
  const updated = await db.prepare(`UPDATE client_project_milestone_approvals SET status = 'cancelled', resolved_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'pending' RETURNING company_id AS companyId, project_id AS projectId, milestone_id AS milestoneId`)
    .get(approvalId);
  if (!updated) return false;
  await logActivity({ companyId: updated.companyId, projectId: updated.projectId, actorId, eventType: 'milestone_approval_cancelled', entityType: 'milestone', entityId: updated.milestoneId });
  return true;
}

async function getProjectData(projectId, { includePrivate = false } = {}) {
  const project = await db.prepare(`SELECT p.id, p.company_id AS companyId, c.company_name AS companyName,
    c.logo_url AS companyLogoUrl, c.created_at AS companyCreatedAt, p.title, p.description, p.scope, p.status, p.category, p.priority,
    p.impact,
    p.assigned_manager_id AS assignedManagerId, COALESCE(NULLIF(manager.full_name, ''), manager.email, '') AS assignedManagerName,
    p.start_date AS startDate, p.target_completion_date AS targetCompletionDate,
    p.estimated_completion_date AS estimatedCompletionDate, p.actual_completion_date AS actualCompletionDate,
    p.created_at AS createdAt, p.updated_at AS updatedAt FROM client_projects p
    JOIN client_companies c ON c.id = p.company_id
    LEFT JOIN user_accounts manager ON manager.id = p.assigned_manager_id WHERE p.id = ?`).get(projectId);
  if (!project) return null;
  const [milestones, tasks, progressHistory, updates, resources, activity, stageRows, feedback, approvals] = await Promise.all([
    db.prepare(`SELECT id, title, description, weight, start_date AS startDate, due_date AS dueDate,
      client_visible AS clientVisible FROM client_project_milestones
      WHERE project_id = ? ORDER BY due_date, created_at`).all(projectId),
    db.prepare(`SELECT id, milestone_id AS milestoneId, stage_id AS stageId, title, description, weight, status,
      completion_percentage AS completionPercentage, due_date AS dueDate, ${includePrivate ? 'development_notes AS developmentNotes, blocker' : "'' AS developmentNotes, '' AS blocker"},
      completed_at AS completedAt FROM client_project_tasks WHERE project_id = ? ORDER BY due_date, created_at`).all(projectId),
    db.prepare(`SELECT recorded_at AS date, planned_percentage AS plannedPercentage, actual_percentage AS actualPercentage
      FROM client_project_progress_history WHERE project_id = ? ORDER BY recorded_at`).all(projectId),
    db.prepare(`SELECT u.id, u.title, u.body, u.stage_id AS stageId, s.title AS stageTitle,
      u.created_at AS createdAt, a.full_name AS authorDisplayName
      FROM client_project_updates u JOIN user_accounts a ON a.id = u.author_id
      LEFT JOIN client_project_stages s ON s.id = u.stage_id WHERE u.project_id = ? ${includePrivate ? '' : 'AND u.client_visible = TRUE'}
      ORDER BY u.created_at DESC LIMIT 30`).all(projectId),
    db.prepare(`SELECT id, project_id AS projectId, resource_type AS resourceType, file_name AS fileName,
      mime_type AS mimeType, size_bytes AS sizeBytes, external_url AS externalUrl, title, description, category,
      visibility, created_at AS createdAt FROM client_project_resources WHERE project_id = ?
      ${includePrivate ? '' : "AND visibility = 'client'"} ORDER BY created_at DESC`).all(projectId),
    includePrivate ? db.prepare(`SELECT id, event_type AS eventType, entity_type AS entityType, entity_id AS entityId,
      metadata, client_visible AS clientVisible, created_at AS createdAt FROM client_project_activity_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT 100`).all(projectId)
      : db.prepare(`SELECT id, event_type AS eventType, entity_type AS entityType, created_at AS createdAt
        FROM client_project_activity_logs WHERE project_id = ? AND client_visible = TRUE ORDER BY created_at DESC LIMIT 100`).all(projectId),
    db.prepare(`SELECT id, project_id AS projectId, title, description, stage_order AS stageOrder, status,
      start_date AS startDate, due_date AS dueDate, completion_percentage AS completionPercentage,
      client_visible AS clientVisible, completed_at AS completedAt FROM client_project_stages WHERE project_id = ? ORDER BY stage_order`).all(projectId),
    db.prepare(`SELECT id, project_id AS projectId, milestone_id AS milestoneId, kind, message, status,
      admin_response AS adminResponse, responded_at AS respondedAt, created_at AS createdAt
      FROM client_project_feedback WHERE project_id = ? ORDER BY created_at DESC LIMIT 100`).all(projectId),
    db.prepare(`SELECT id, milestone_id AS milestoneId, request_note AS requestNote, status,
      client_comment AS clientComment, requested_at AS requestedAt, resolved_at AS resolvedAt
      FROM client_project_milestone_approvals WHERE project_id = ? ORDER BY requested_at DESC LIMIT 100`).all(projectId),
  ]);
  const updateIds = updates.map((update) => update.id);
  const attachedResources = updateIds.length
    ? await db.prepare(`SELECT ur.update_id AS updateId, r.id, r.title, r.resource_type AS resourceType,
        r.visibility, r.category FROM client_project_update_resources ur
      JOIN client_project_resources r ON r.id = ur.resource_id
      WHERE ur.update_id IN (${updateIds.map(() => '?').join(', ')}) ${includePrivate ? '' : "AND r.visibility = 'client'"}`).all(...updateIds)
    : [];
  const resourcesByUpdate = new Map();
  for (const resource of attachedResources) resourcesByUpdate.set(resource.updateId, [...(resourcesByUpdate.get(resource.updateId) || []), resource]);
  const normalizedTasks = tasks.map((task) => ({ ...task, weight: Number(task.weight), completionPercentage: Number(task.completionPercentage) }));
  const normalizedMilestones = milestones.map((milestone) => {
    const completionPercentage = milestoneCompletion(milestone, tasks);
    return { ...milestone, weight: Number(milestone.weight), completionPercentage, status: milestoneStatus(milestone, tasks) };
  });
  const stages = stageRows.filter((stage) => includePrivate || stage.clientVisible).map((stage) => ({ ...stage, completionPercentage: Number(stage.completionPercentage) }));
  const visibleMilestones = normalizedMilestones.filter((milestone) => includePrivate || milestone.clientVisible);
  const visibleTasks = normalizedTasks.filter((task) => includePrivate
    || (visibleMilestones.some((milestone) => milestone.id === task.milestoneId)
      && (!task.stageId || stages.some((stage) => stage.id === task.stageId))));
  const currentStage = stages.find((stage) => stage.status === 'in_progress') || stages.find((stage) => stage.status === 'upcoming') || null;
  const todayDate = new Date();
  todayDate.setUTCHours(0, 0, 0, 0);
  const remainingDate = project.estimatedCompletionDate || project.targetCompletionDate;
  const estimatedDaysRemaining = remainingDate ? Math.ceil((Date.parse(`${String(remainingDate).slice(0, 10)}T00:00:00Z`) - todayDate.getTime()) / 86_400_000) : null;
  const { companyCreatedAt, ...projectData } = project;
  return {
    ...projectData,
    startDate: companyDate(companyCreatedAt),
    progress: {
      overallPercentage: normalizedTasks.length
        ? calculateWeightedProgress(normalizedTasks)
        : calculateWeightedProgress(normalizedMilestones),
      phases: normalizedMilestones.map(({ id, title, completionPercentage }) => ({ milestoneId: id, label: title, completionPercentage })),
      history: progressHistory.map((point) => ({ ...point, plannedPercentage: Number(point.plannedPercentage), actualPercentage: Number(point.actualPercentage) })),
      completedTaskCount: visibleTasks.filter((task) => task.status === 'completed').length,
      remainingTaskCount: visibleTasks.filter((task) => task.status !== 'completed').length,
      completedMilestoneCount: visibleMilestones.filter((milestone) => milestone.status === 'completed').length,
      remainingMilestoneCount: visibleMilestones.filter((milestone) => milestone.status !== 'completed').length,
      overdueMilestoneCount: visibleMilestones.filter((milestone) => milestone.status === 'delayed').length,
      estimatedDaysRemaining,
      currentStage,
    },
    milestones: visibleMilestones.map((milestone) => ({ ...milestone, taskIds: visibleTasks.filter((task) => task.milestoneId === milestone.id).map((task) => task.id) })),
    stages,
    tasks: visibleTasks,
    updates: updates.map((update) => ({ ...update, resources: resourcesByUpdate.get(update.id) || [] })),
    resources,
    feedback,
    approvals,
    activity,
  };
}

export async function getAdminProject(projectId) {
  return getProjectData(projectId, { includePrivate: true });
}

export async function getAdminCompanyDashboard() {
  const [companies, projects] = await Promise.all([listCompanies(), listAdminProjects()]);
  const projectDetails = await Promise.all(projects.map((project) => getAdminProject(project.id)));
  return { companies, projects: projectDetails.filter(Boolean) };
}

export async function getClientProjects(companyId) {
  const projects = await db.prepare(`SELECT id FROM client_projects WHERE company_id = ?
    ORDER BY created_at DESC`).all(companyId);
  return Promise.all(projects.map((project) => getProjectData(project.id)));
}

export async function getClientProject(companyId, projectId) {
  const project = await db.prepare('SELECT id FROM client_projects WHERE company_id = ? AND id = ?').get(companyId, projectId);
  return project ? getProjectData(projectId) : null;
}

export async function createProjectResource(projectId, resource, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return null;
  const id = crypto.randomUUID();
  const privateMedia = db.dialect === 'postgres' && resource.resourceType !== 'link';
  const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm', 'application/pdf': 'pdf' })[resource.mimeType] || 'bin';
  const storagePath = privateMedia ? `projects/${projectId}/${id}.${extension}` : null;
  const content = privateMedia || resource.resourceType === 'link' ? null : resource.content || null;
  if (privateMedia) await storeProjectMedia(storagePath, resource.content, resource.mimeType);
  try {
    await db.transaction(async () => {
      await db.prepare(`INSERT INTO client_project_resources
        (id, project_id, resource_type, file_name, mime_type, size_bytes, content, storage_path, category, external_url, title, description, visibility, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, projectId, resource.resourceType, resource.fileName || '', resource.mimeType || '', resource.content?.length || 0,
          content, storagePath, resource.category || 'other', resource.externalUrl || '', resource.title, resource.description || '', resource.visibility, actorId);
      await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'project_resource_added', entityType: 'resource', entityId: id, metadata: { resourceType: resource.resourceType, visibility: resource.visibility } });
    })();
  } catch (error) {
    if (storagePath) await deleteProjectMedia(storagePath).catch(() => {});
    throw error;
  }
  return db.prepare(`SELECT id, project_id AS projectId, resource_type AS resourceType, file_name AS fileName,
    mime_type AS mimeType, size_bytes AS sizeBytes, external_url AS externalUrl, title, description, category,
    visibility, created_at AS createdAt FROM client_project_resources WHERE id = ?`).get(id);
}

export async function getProjectResource(projectId, resourceId, companyId = null) {
  return await db.prepare(`SELECT r.id, p.company_id AS companyId, r.project_id AS projectId, r.resource_type AS resourceType, r.file_name AS fileName,
    r.mime_type AS mimeType, r.size_bytes AS sizeBytes, r.content, r.storage_path AS storagePath, r.external_url AS externalUrl, r.title,
    r.description, r.category, r.visibility, r.created_at AS createdAt FROM client_project_resources r
    JOIN client_projects p ON p.id = r.project_id WHERE r.project_id = ? AND r.id = ?
    ${companyId ? "AND p.company_id = ? AND r.visibility = 'client'" : ''}`)
    .get(...(companyId ? [projectId, resourceId, companyId] : [projectId, resourceId])) || null;
}

export async function deleteProjectResource(projectId, resourceId, actorId) {
  const resource = await db.prepare(`SELECT r.id, r.storage_path AS storagePath, p.company_id AS companyId FROM client_project_resources r
    JOIN client_projects p ON p.id = r.project_id WHERE r.project_id = ? AND r.id = ?`).get(projectId, resourceId);
  if (!resource) return false;
  await db.transaction(async () => {
    await db.prepare('DELETE FROM client_project_resources WHERE project_id = ? AND id = ?').run(projectId, resourceId);
    await logActivity({ companyId: resource.companyId, projectId, actorId, eventType: 'project_resource_removed', entityType: 'resource', entityId: resourceId });
  })();
  if (resource.storagePath) {
    try { await deleteProjectMedia(resource.storagePath); }
    catch (error) { console.error('Private project media cleanup failed', error?.code || 'storage_error'); }
  }
  return true;
}

export async function replaceProjectResource(projectId, resourceId, resource, actorId) {
  const existing = await getProjectResource(projectId, resourceId);
  if (!existing || existing.resourceType === 'link') return null;
  const privateMedia = db.dialect === 'postgres';
  const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm', 'application/pdf': 'pdf' })[resource.mimeType] || 'bin';
  const storagePath = privateMedia ? `projects/${projectId}/${resourceId}-${crypto.randomUUID()}.${extension}` : null;
  if (privateMedia) await storeProjectMedia(storagePath, resource.content, resource.mimeType);
  try {
    await db.transaction(async () => {
      await db.prepare(`UPDATE client_project_resources SET resource_type = ?, file_name = ?, mime_type = ?, size_bytes = ?, content = ?, storage_path = ?,
        title = ?, description = ?, category = ? WHERE project_id = ? AND id = ?`)
        .run(resource.resourceType, resource.fileName || existing.fileName, resource.mimeType, resource.content.length, privateMedia ? null : resource.content,
          storagePath, resource.title || existing.title, resource.description ?? existing.description, resource.category || existing.category || 'other', projectId, resourceId);
      await logActivity({ companyId: existing.companyId, projectId, actorId, eventType: 'project_resource_replaced', entityType: 'resource', entityId: resourceId, metadata: { resourceType: existing.resourceType, visibility: existing.visibility } });
    })();
  } catch (error) {
    if (storagePath) await deleteProjectMedia(storagePath).catch(() => {});
    throw error;
  }
  if (existing.storagePath) {
    try { await deleteProjectMedia(existing.storagePath); }
    catch (error) { console.error('Replaced private project media cleanup failed', error?.code || 'storage_error'); }
  }
  return true;
}

export async function setProjectResourceVisibility(projectId, resourceId, visibility, actorId) {
  const resource = await db.prepare(`SELECT r.id, p.company_id AS companyId FROM client_project_resources r
    JOIN client_projects p ON p.id = r.project_id WHERE r.project_id = ? AND r.id = ?`).get(projectId, resourceId);
  if (!resource) return false;
  await db.prepare('UPDATE client_project_resources SET visibility = ? WHERE project_id = ? AND id = ?').run(visibility, projectId, resourceId);
  await logActivity({ companyId: resource.companyId, projectId, actorId, eventType: 'project_resource_visibility_changed', entityType: 'resource', entityId: resourceId, metadata: { visibility } });
  return true;
}

export async function listProjectActivity(projectId) {
  return db.prepare(`SELECT l.id, l.event_type AS eventType, l.entity_type AS entityType, l.entity_id AS entityId,
    l.metadata, l.created_at AS createdAt, u.full_name AS actorName FROM client_project_activity_logs l
    LEFT JOIN user_accounts u ON u.id = l.actor_id WHERE l.project_id = ? ORDER BY l.created_at DESC LIMIT 200`).all(projectId);
}

export async function listCompanyProjects(companyId) {
  return db.prepare(`SELECT id, title, status FROM client_projects WHERE company_id = ? ORDER BY created_at DESC`).all(companyId);
}
