import crypto from 'node:crypto';
import { getDb } from './db.js';

const db = getDb();
const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CLIENT_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

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
  const random = crypto.randomBytes(10);
  let buffer = 0;
  let bitCount = 0;
  let output = '';
  for (const byte of random) {
    buffer = (buffer << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5 && output.length < 15) {
      bitCount -= 5;
      output += CODE_ALPHABET[(buffer >>> bitCount) & 31];
      buffer &= (1 << bitCount) - 1;
    }
    if (output.length === 15) break;
  }
  return output;
}

export function isValidAccessCodeFormat(code) {
  return typeof code === 'string' && /^[0-9A-HJKMNP-TV-Z]{10,15}$/i.test(code.trim());
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
  if (milestone.due_date && new Date(`${milestone.due_date}T23:59:59Z`) < now) return 'delayed';
  if (completion > 0 || children.some((task) => task.status === 'in_progress')) return 'in_progress';
  return 'upcoming';
}

async function logActivity({ companyId, projectId, actorId, eventType, entityType, entityId, metadata = {} }) {
  await db.prepare(`INSERT INTO client_project_activity_logs
    (id, company_id, project_id, actor_id, actor_type, event_type, entity_type, entity_id, metadata)
    VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?)`)
    .run(crypto.randomUUID(), companyId, projectId || null, actorId, eventType, entityType, entityId || null, JSON.stringify(metadata));
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
    (id, company_name, contact_person, email, phone, description, status, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`)
    .run(id, data.companyName, data.contactPerson || '', data.email || '', data.phone || '', data.description || '', actorId, actorId);
  await logActivity({ companyId: id, actorId, eventType: 'company_created', entityType: 'company', entityId: id });
  return getCompany(id);
}

export async function updateCompany(companyId, data, actorId) {
  const result = await db.prepare(`UPDATE client_companies SET company_name = ?, contact_person = ?, email = ?, phone = ?,
    description = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(data.companyName, data.contactPerson || '', data.email || '', data.phone || '', data.description || '', actorId, companyId);
  if (!result.changes) return null;
  await logActivity({ companyId, actorId, eventType: 'company_updated', entityType: 'company', entityId: companyId });
  return getCompany(companyId);
}

export async function getCompany(companyId) {
  return await db.prepare(`SELECT id, company_name AS companyName, contact_person AS contactPerson, email, phone,
    description, status, created_at AS createdAt, updated_at AS updatedAt FROM client_companies WHERE id = ?`).get(companyId) || null;
}

export async function listCompanies() {
  const companies = await db.prepare(`SELECT c.id, c.company_name AS companyName, c.contact_person AS contactPerson,
    c.email, c.phone, c.description, c.status, c.created_at AS createdAt, c.updated_at AS updatedAt,
    (SELECT COUNT(*) FROM client_projects p WHERE p.company_id = c.id) AS projectCount,
    (SELECT COUNT(*) FROM client_company_access_codes a WHERE a.company_id = c.id AND a.status = 'active' AND (a.expires_at IS NULL OR a.expires_at > ?)) AS hasActiveCode
    FROM client_companies c ORDER BY c.created_at DESC`).all(new Date().toISOString());
  return companies.map((company) => ({ ...company, projectCount: Number(company.projectCount), hasActiveCode: Number(company.hasActiveCode) > 0 }));
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
    const company = await db.prepare(`SELECT c.id FROM client_company_access_codes a
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
    return { companyId: company.id, token, csrfToken, expiresAt };
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
    s.expires_at AS expiresAt FROM client_sessions s JOIN client_companies c ON c.id = s.company_id
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
  return db.prepare(`SELECT p.id, p.company_id AS companyId, c.company_name AS companyName, p.title, p.description,
    p.status, p.start_date AS startDate, p.target_completion_date AS targetCompletionDate,
    p.estimated_completion_date AS estimatedCompletionDate, p.actual_completion_date AS actualCompletionDate,
    p.created_at AS createdAt FROM client_projects p JOIN client_companies c ON c.id = p.company_id
    ORDER BY p.created_at DESC`).all();
}

export async function createProject(data, actorId) {
  const company = await db.prepare("SELECT id FROM client_companies WHERE id = ? AND status = 'active'").get(data.companyId);
  if (!company) return null;
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_projects (id, company_id, title, description, scope, status, start_date,
      target_completion_date, estimated_completion_date, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, data.companyId, data.title, data.description || '', data.scope || '', data.status || 'planning', data.startDate || null,
        data.targetCompletionDate || null, data.estimatedCompletionDate || null, actorId, actorId);
    await logActivity({ companyId: data.companyId, projectId: id, actorId, eventType: 'project_created', entityType: 'project', entityId: id });
    await recordProgressSnapshot(id, 'project_created');
  })();
  return getAdminProject(id);
}

export async function updateProject(projectId, data, actorId) {
  const existing = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!existing) return null;
  await db.transaction(async () => {
    await db.prepare(`UPDATE client_projects SET title = ?, description = ?, scope = ?, status = ?, start_date = ?,
      target_completion_date = ?, estimated_completion_date = ?, actual_completion_date = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`).run(data.title, data.description || '', data.scope || '', data.status, data.startDate || null, data.targetCompletionDate || null,
      data.estimatedCompletionDate || null, data.actualCompletionDate || null, actorId, projectId);
    await logActivity({ companyId: existing.companyId, projectId, actorId, eventType: 'project_updated', entityType: 'project', entityId: projectId });
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
    await db.prepare(`UPDATE client_project_milestones SET title = ?, description = ?, weight = ?, start_date = ?, due_date = ?,
      updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`)
      .run(data.title, data.description || '', data.weight, data.startDate || null, data.dueDate || null, milestoneId, projectId);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'milestone_updated', entityType: 'milestone', entityId: milestoneId });
    await recordProgressSnapshot(projectId, 'milestone_updated');
  })();
  return getAdminProject(projectId);
}

export async function createTask(projectId, milestoneId, data, actorId) {
  const milestone = await db.prepare(`SELECT m.id, p.company_id AS companyId FROM client_project_milestones m
    JOIN client_projects p ON p.id = m.project_id WHERE m.id = ? AND m.project_id = ?`).get(milestoneId, projectId);
  if (!milestone) return null;
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_tasks (id, project_id, milestone_id, title, description, weight,
      status, completion_percentage, due_date, development_notes, blocker, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, projectId, milestoneId, data.title, data.description || '', data.weight, data.status || 'upcoming',
        data.status === 'completed' ? 100 : data.status === 'upcoming' ? 0 : Number(data.completionPercentage || 0), data.dueDate || null,
        data.developmentNotes || '', data.blocker || '', data.status === 'completed' ? new Date().toISOString() : null);
    await logActivity({ companyId: milestone.companyId, projectId, actorId, eventType: 'task_created', entityType: 'task', entityId: id });
    await recordProgressSnapshot(projectId, 'task_created');
  })();
  return getAdminProject(projectId);
}

export async function updateTask(projectId, taskId, data, actorId) {
  const task = await db.prepare(`SELECT t.id, p.company_id AS companyId FROM client_project_tasks t
    JOIN client_projects p ON p.id = t.project_id WHERE t.id = ? AND t.project_id = ?`).get(taskId, projectId);
  if (!task) return null;
  const completion = data.status === 'completed' ? 100 : data.status === 'upcoming' ? 0 : Number(data.completionPercentage || 0);
  await db.transaction(async () => {
    await db.prepare(`UPDATE client_project_tasks SET title = ?, description = ?, weight = ?, status = ?,
      completion_percentage = ?, due_date = ?, development_notes = ?, blocker = ?,
      completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`)
      .run(data.title, data.description || '', data.weight, data.status, completion, data.dueDate || null,
        data.developmentNotes || '', data.blocker || '', data.status === 'completed' ? new Date().toISOString() : null, taskId, projectId);
    await logActivity({ companyId: task.companyId, projectId, actorId, eventType: 'task_updated', entityType: 'task', entityId: taskId });
    await recordProgressSnapshot(projectId, 'task_updated');
  })();
  return getAdminProject(projectId);
}

export async function createProjectUpdate(projectId, { title, body }, actorId) {
  const project = await db.prepare('SELECT company_id AS companyId FROM client_projects WHERE id = ?').get(projectId);
  if (!project) return null;
  const id = crypto.randomUUID();
  await db.transaction(async () => {
    await db.prepare('INSERT INTO client_project_updates (id, project_id, author_id, title, body) VALUES (?, ?, ?, ?, ?)')
      .run(id, projectId, actorId, title, body);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'project_update_published', entityType: 'update', entityId: id });
    await recordProgressSnapshot(projectId, 'project_update');
  })();
  return getAdminProject(projectId);
}

async function getProjectData(projectId, { includePrivate = false } = {}) {
  const project = await db.prepare(`SELECT p.id, p.company_id AS companyId, p.title, p.description, p.scope, p.status,
    p.start_date AS startDate, p.target_completion_date AS targetCompletionDate,
    p.estimated_completion_date AS estimatedCompletionDate, p.actual_completion_date AS actualCompletionDate,
    p.created_at AS createdAt, p.updated_at AS updatedAt FROM client_projects p WHERE p.id = ?`).get(projectId);
  if (!project) return null;
  const [milestones, tasks, progressHistory, updates, resources, activity] = await Promise.all([
    db.prepare(`SELECT id, title, description, weight, start_date AS startDate, due_date AS dueDate FROM client_project_milestones
      WHERE project_id = ? ORDER BY due_date, created_at`).all(projectId),
    db.prepare(`SELECT id, milestone_id AS milestoneId, title, description, weight, status,
      completion_percentage AS completionPercentage, due_date AS dueDate, ${includePrivate ? 'development_notes AS developmentNotes, blocker' : "'' AS developmentNotes, '' AS blocker"},
      completed_at AS completedAt FROM client_project_tasks WHERE project_id = ? ORDER BY due_date, created_at`).all(projectId),
    db.prepare(`SELECT recorded_at AS date, planned_percentage AS plannedPercentage, actual_percentage AS actualPercentage
      FROM client_project_progress_history WHERE project_id = ? ORDER BY recorded_at`).all(projectId),
    db.prepare(`SELECT u.id, u.title, u.body, u.created_at AS createdAt, a.full_name AS authorDisplayName
      FROM client_project_updates u JOIN user_accounts a ON a.id = u.author_id WHERE u.project_id = ?
      ORDER BY u.created_at DESC LIMIT 30`).all(projectId),
    db.prepare(`SELECT id, project_id AS projectId, resource_type AS resourceType, file_name AS fileName,
      mime_type AS mimeType, size_bytes AS sizeBytes, external_url AS externalUrl, title, description,
      visibility, created_at AS createdAt FROM client_project_resources WHERE project_id = ?
      ${includePrivate ? '' : "AND visibility = 'client'"} ORDER BY created_at DESC`).all(projectId),
    includePrivate ? db.prepare(`SELECT id, event_type AS eventType, entity_type AS entityType, entity_id AS entityId,
      metadata, created_at AS createdAt FROM client_project_activity_logs WHERE project_id = ? ORDER BY created_at DESC LIMIT 100`).all(projectId) : Promise.resolve([]),
  ]);
  const normalizedTasks = tasks.map((task) => ({ ...task, weight: Number(task.weight), completionPercentage: Number(task.completionPercentage) }));
  const normalizedMilestones = milestones.map((milestone) => {
    const completionPercentage = milestoneCompletion(milestone, tasks);
    return { ...milestone, weight: Number(milestone.weight), completionPercentage, status: milestoneStatus(milestone, tasks) };
  });
  return {
    ...project,
    progress: {
      overallPercentage: normalizedTasks.length
        ? calculateWeightedProgress(normalizedTasks)
        : calculateWeightedProgress(normalizedMilestones),
      phases: normalizedMilestones.map(({ id, title, completionPercentage }) => ({ milestoneId: id, label: title, completionPercentage })),
      history: progressHistory.map((point) => ({ ...point, plannedPercentage: Number(point.plannedPercentage), actualPercentage: Number(point.actualPercentage) })),
    },
    milestones: normalizedMilestones.map((milestone) => ({ ...milestone, taskIds: normalizedTasks.filter((task) => task.milestoneId === milestone.id).map((task) => task.id) })),
    tasks: normalizedTasks,
    updates,
    resources,
    activity: includePrivate ? activity : undefined,
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
  const content = resource.content || null;
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO client_project_resources
      (id, project_id, resource_type, file_name, mime_type, size_bytes, content, external_url, title, description, visibility, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, projectId, resource.resourceType, resource.fileName || '', resource.mimeType || '', content?.length || 0,
        content, resource.externalUrl || '', resource.title, resource.description || '', resource.visibility, actorId);
    await logActivity({ companyId: project.companyId, projectId, actorId, eventType: 'project_resource_added', entityType: 'resource', entityId: id, metadata: { resourceType: resource.resourceType, visibility: resource.visibility } });
  })();
  return db.prepare(`SELECT id, project_id AS projectId, resource_type AS resourceType, file_name AS fileName,
    mime_type AS mimeType, size_bytes AS sizeBytes, external_url AS externalUrl, title, description,
    visibility, created_at AS createdAt FROM client_project_resources WHERE id = ?`).get(id);
}

export async function getProjectResource(projectId, resourceId, companyId = null) {
  return await db.prepare(`SELECT r.id, r.project_id AS projectId, r.resource_type AS resourceType, r.file_name AS fileName,
    r.mime_type AS mimeType, r.size_bytes AS sizeBytes, r.content, r.external_url AS externalUrl, r.title,
    r.description, r.visibility, r.created_at AS createdAt FROM client_project_resources r
    JOIN client_projects p ON p.id = r.project_id WHERE r.project_id = ? AND r.id = ?
    ${companyId ? "AND p.company_id = ? AND r.visibility = 'client'" : ''}`)
    .get(...(companyId ? [projectId, resourceId, companyId] : [projectId, resourceId])) || null;
}

export async function deleteProjectResource(projectId, resourceId, actorId) {
  const resource = await db.prepare(`SELECT r.id, p.company_id AS companyId FROM client_project_resources r
    JOIN client_projects p ON p.id = r.project_id WHERE r.project_id = ? AND r.id = ?`).get(projectId, resourceId);
  if (!resource) return false;
  await db.transaction(async () => {
    await db.prepare('DELETE FROM client_project_resources WHERE project_id = ? AND id = ?').run(projectId, resourceId);
    await logActivity({ companyId: resource.companyId, projectId, actorId, eventType: 'project_resource_removed', entityType: 'resource', entityId: resourceId });
  })();
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
