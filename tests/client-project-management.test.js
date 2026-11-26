import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import Database from 'better-sqlite3';

process.env.NODE_ENV = 'test';

async function unusedPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function startIsolatedServer(serverPath, databasePath, cwd, port, { projectManagementEnabled = false } = {}) {
  const childEnv = {
    ...process.env,
    NODE_ENV: 'test',
    SQLITE_PATH: databasePath,
    PORT: String(port),
    HOST: '127.0.0.1',
    ZIYOTECH_SKIP_ANALYTICS_MAINTENANCE: '1',
    PROJECT_MANAGEMENT_ENABLED: projectManagementEnabled ? 'true' : 'false',
    CLIENT_ACCESS_CODE_PEPPER: 'isolated-project-access-pepper-32-bytes-minimum',
  };
  delete childEnv.DATABASE_URL;
  const child = spawn(process.execPath, [serverPath], { cwd, env: childEnv, stdio: 'ignore', windowsHide: true });
  const baseUrl = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error('Isolated test backend exited before becoming ready.');
    try {
      const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(250) });
      if (response.ok) { ready = true; break; }
    } catch { /* Retry while the isolated backend starts. */ }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(ready, true, 'isolated backend should start');
  return { child, baseUrl };
}

async function stopIsolatedServer(child) {
  if (!child || child.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill();
  await exited;
}

function cookieHeader(response) {
  return (response.headers.getSetCookie?.() || []).map((value) => value.split(';', 1)[0]).join('; ');
}

test('SQLite Project Management API supports authenticated company/project workflows and company-scoped client sessions', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ziyotech-project-management-'));
  const databasePath = path.join(directory, 'isolated-test.db');
  const serverPath = path.resolve('server/index.js');
  const migrationPath = path.resolve('server/migrations/003_client_project_management.sql');
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const dbModule = await import('../server/db.js');
  let child;

  try {
    await dbModule.initializeDatabase({ forceSqlite: true, sqlitePath: databasePath, seedDemoData: false });
    await dbModule.closeDatabase();

    const database = new Database(databasePath);
    database.pragma('foreign_keys = ON');
    database.prepare(`INSERT INTO user_accounts (id, email, full_name, auth_provider, email_verified, role)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run('project-test-admin', 'pm-admin@example.test', 'PM Test Admin', 'password', 1, 'admin');
    database.close();

    process.env.SQLITE_PATH = databasePath;
    await dbModule.initializeDatabase({ forceSqlite: true, sqlitePath: databasePath, seedDemoData: false });
    const auth = await import('../server/adminAuthService.js');
    const credentials = await auth.hashAdminPassword('isolated-project-test-password');
    await auth.saveAdminCredential({ accountId: 'project-test-admin', username: 'ProjectTestAdmin', ...credentials });
    await dbModule.closeDatabase();
    delete process.env.SQLITE_PATH;

    const probePort = await unusedPort();
    const probe = await startIsolatedServer(serverPath, databasePath, directory, probePort);
    child = probe.child;
    const disabledManagement = await fetch(`${probe.baseUrl}/api/admin/client-projects`);
    assert.equal(disabledManagement.status, 503);
    assert.equal((await disabledManagement.json()).error, 'Project Management is temporarily unavailable.');
    await stopIsolatedServer(child);
    child = null;

    const enabledProbe = await startIsolatedServer(serverPath, databasePath, directory, await unusedPort(), { projectManagementEnabled: true });
    child = enabledProbe.child;
    const localCors = await fetch(`${enabledProbe.baseUrl}/api/admin/login`, {
      method: 'OPTIONS',
      headers: { Origin: 'http://127.0.0.1:3001', 'Access-Control-Request-Method': 'POST' },
    });
    assert.equal(localCors.headers.get('access-control-allow-origin'), 'http://127.0.0.1:3001');
    assert.equal(localCors.headers.get('access-control-allow-credentials'), 'true');
    const preMigrationLogin = await fetch(`${enabledProbe.baseUrl}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ProjectTestAdmin', password: 'isolated-project-test-password' }),
    });
    assert.equal(preMigrationLogin.status, 200);
    const preMigrationCookie = cookieHeader(preMigrationLogin);
    const missingSchema = await fetch(`${enabledProbe.baseUrl}/api/admin/client-projects`, { headers: { Cookie: preMigrationCookie } });
    assert.equal(missingSchema.status, 503);
    assert.match((await missingSchema.json()).error, /separately approved PostgreSQL migration/i);
    await stopIsolatedServer(child);
    child = null;

    const migratedFixture = new Database(databasePath);
    migratedFixture.pragma('foreign_keys = ON');
    migratedFixture.exec(await fs.readFile(migrationPath, 'utf8'));
    migratedFixture.close();

    const port = await unusedPort();
    const started = await startIsolatedServer(serverPath, databasePath, directory, port, { projectManagementEnabled: true });
    child = started.child;
    const baseUrl = started.baseUrl;

    const missingAuth = await fetch(`${baseUrl}/api/admin/client-projects`);
    assert.equal(missingAuth.status, 401);
    assert.equal(missingAuth.headers.get('content-type')?.includes('application/json'), true);

    const invalidLogin = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ProjectTestAdmin', password: 'incorrect-isolated-password' }),
    });
    assert.equal(invalidLogin.status, 401);

    const login = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ProjectTestAdmin', password: 'isolated-project-test-password' }),
    });
    assert.equal(login.status, 200);
    const loginPayload = await login.json();
    const adminCookie = cookieHeader(login);
    assert.match(adminCookie, /ziyotech_admin_session=/);
    const adminHeaders = { Cookie: adminCookie, 'Content-Type': 'application/json', 'X-CSRF-Token': loginPayload.csrfToken };
    assert.equal((await fetch(`${baseUrl}/api/admin/session`, { headers: { Cookie: adminCookie } })).status, 200);

    const noCsrf = await fetch(`${baseUrl}/api/admin/client-projects/companies`, {
      method: 'POST', headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Must not be created without CSRF' }),
    });
    assert.equal(noCsrf.status, 403);

    const listedEmpty = await fetch(`${baseUrl}/api/admin/client-projects`, { headers: adminHeaders });
    assert.equal(listedEmpty.status, 200);
    assert.deepEqual((await listedEmpty.json()).companies, []);

    const createCompany = async (companyName) => {
      const response = await fetch(`${baseUrl}/api/admin/client-projects/companies`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ companyName, contactPerson: 'Test Contact', email: 'contact@example.test', phone: '+998900000000', description: 'Isolated API test company' }),
      });
      assert.equal(response.status, 201);
      return response.json();
    };
    const companyA = await createCompany('Project Test Company A');
    const companyB = await createCompany('Project Test Company B');

    const editCompany = await fetch(`${baseUrl}/api/admin/client-projects/companies/${companyA.id}`, {
      method: 'PUT', headers: adminHeaders,
      body: JSON.stringify({ companyName: 'Project Test Company A Edited', contactPerson: 'Updated Contact', email: 'updated@example.test', phone: '+998911111111', description: 'Updated by isolated test' }),
    });
    assert.equal(editCompany.status, 200);
    assert.equal((await editCompany.json()).companyName, 'Project Test Company A Edited');

    const deactivate = await fetch(`${baseUrl}/api/admin/client-projects/companies/${companyB.id}/status`, {
      method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ status: 'inactive' }),
    });
    assert.equal(deactivate.status, 200);
    const reactivate = await fetch(`${baseUrl}/api/admin/client-projects/companies/${companyB.id}/status`, {
      method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ status: 'active' }),
    });
    assert.equal(reactivate.status, 200);

    const createProject = async (companyId, title) => {
      const response = await fetch(`${baseUrl}/api/admin/client-projects/projects`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ companyId, title, description: 'Isolated test project', scope: 'API regression', startDate: '2026-11-01', targetCompletionDate: '2026-12-20', estimatedCompletionDate: '2026-12-22', status: 'planning' }),
      });
      assert.equal(response.status, 201);
      return response.json();
    };
    const projectA = await createProject(companyA.id, 'Project A');
    const projectB = await createProject(companyB.id, 'Project B');
    assert.equal(projectA.companyId, companyA.id);

    const editProject = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}`, {
      method: 'PUT', headers: adminHeaders,
      body: JSON.stringify({ title: 'Project A Updated', description: 'Updated description', scope: 'Expanded scope', startDate: '2026-11-01', targetCompletionDate: '2026-12-20', estimatedCompletionDate: '2026-12-23', status: 'in_progress' }),
    });
    assert.equal(editProject.status, 200);

    const codeResponse = await fetch(`${baseUrl}/api/admin/client-projects/companies/${companyA.id}/access-code`, {
      method: 'POST', headers: adminHeaders, body: JSON.stringify({}),
    });
    assert.equal(codeResponse.status, 201);
    const firstCode = (await codeResponse.json()).code;
    const rotateCodeResponse = await fetch(`${baseUrl}/api/admin/client-projects/companies/${companyA.id}/access-code`, {
      method: 'POST', headers: adminHeaders, body: JSON.stringify({}),
    });
    assert.equal(rotateCodeResponse.status, 201);
    const issuedCode = (await rotateCodeResponse.json()).code;
    assert.notEqual(issuedCode, firstCode);
    assert.match(issuedCode, /^[0-9A-HJKMNP-TV-Z]{10,15}$/);

    const milestoneResponse = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/milestones`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ title: 'Implementation', description: 'Core build', weight: 10, startDate: '2026-11-01', dueDate: '2026-12-10' }),
    });
    assert.equal(milestoneResponse.status, 201);
    const milestoneProject = await milestoneResponse.json();
    const milestone = milestoneProject.milestones[0];

    const milestoneEdit = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/milestones/${milestone.id}`, {
      method: 'PUT', headers: adminHeaders,
      body: JSON.stringify({ title: 'Implementation Edited', description: 'Core build and integration', weight: 12, startDate: '2026-11-01', dueDate: '2026-12-12' }),
    });
    assert.equal(milestoneEdit.status, 200);

    const taskResponse = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/milestones/${milestone.id}/tasks`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ title: 'Build dashboard', description: 'Create core dashboard', weight: 5, status: 'in_progress', completionPercentage: 55, dueDate: '2026-12-05', developmentNotes: 'In progress', blocker: '' }),
    });
    assert.equal(taskResponse.status, 201);
    const taskProject = await taskResponse.json();
    const task = taskProject.tasks[0];
    assert.ok(taskProject.progress.history.length > 0);

    const taskEdit = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/tasks/${task.id}`, {
      method: 'PATCH', headers: adminHeaders,
      body: JSON.stringify({ ...task, status: 'completed', completionPercentage: 100 }),
    });
    assert.equal(taskEdit.status, 200);

    const updateResponse = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/updates`, {
      method: 'POST', headers: adminHeaders, body: JSON.stringify({ title: 'Progress update', body: 'The dashboard milestone is complete.' }),
    });
    assert.equal(updateResponse.status, 201);

    const linkResponse = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/resources/link`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ title: 'Preview', description: 'Test link', url: 'https://example.com/project-preview', visibility: 'client' }),
    });
    assert.equal(linkResponse.status, 201);
    const resource = await linkResponse.json();

    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6j9ioAAAAASUVORK5CYII=', 'base64');
    const uploadResponse = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/resources/upload`, {
      method: 'POST', headers: {
        Cookie: adminCookie, 'Content-Type': 'image/png', 'X-CSRF-Token': loginPayload.csrfToken,
        'X-Resource-Title': encodeURIComponent('Test screenshot'),
        'X-Resource-Description': encodeURIComponent('Isolated upload check'),
        'X-Resource-Visibility': 'client',
        'X-Resource-File-Name': encodeURIComponent('screenshot.png'),
      }, body: png,
    });
    assert.equal(uploadResponse.status, 201);
    const uploadedResource = await uploadResponse.json();

    const activity = await fetch(`${baseUrl}/api/admin/client-projects/projects/${projectA.id}/activity`, { headers: adminHeaders });
    assert.equal(activity.status, 200);
    assert.ok((await activity.json()).length > 0);

    const allProjects = await fetch(`${baseUrl}/api/admin/client-projects`, { headers: adminHeaders });
    assert.equal(allProjects.status, 200);
    assert.equal((await allProjects.json()).projects.length, 2);

    const clientLogin = await fetch(`${baseUrl}/api/client-portal/access`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: issuedCode }),
    });
    assert.equal(clientLogin.status, 200);
    const clientPayload = await clientLogin.json();
    const clientCookie = cookieHeader(clientLogin);
    assert.match(clientCookie, /ziyotech_client_session=/);
    const clientHeaders = { Cookie: clientCookie };
    const clientSession = await fetch(`${baseUrl}/api/client-portal/session`, { headers: clientHeaders });
    assert.equal(clientSession.status, 200);
    const ownProjects = await fetch(`${baseUrl}/api/client-portal/projects`, { headers: clientHeaders });
    assert.equal(ownProjects.status, 200);
    assert.deepEqual((await ownProjects.json()).projects.map((project) => project.id), [projectA.id]);
    assert.equal((await fetch(`${baseUrl}/api/client-portal/projects/${projectB.id}`, { headers: clientHeaders })).status, 404);
    const sharedResource = await fetch(`${baseUrl}/api/client-portal/projects/${projectA.id}/resources/${resource.id}/content`, { headers: clientHeaders });
    assert.equal(sharedResource.status, 200);
    assert.equal((await sharedResource.json()).externalUrl, 'https://example.com/project-preview');
    const sharedUpload = await fetch(`${baseUrl}/api/client-portal/projects/${projectA.id}/resources/${uploadedResource.id}/content`, { headers: clientHeaders });
    assert.equal(sharedUpload.status, 200);
    assert.equal(sharedUpload.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await sharedUpload.arrayBuffer()), png);

    const clientLogout = await fetch(`${baseUrl}/api/client-portal/logout`, {
      method: 'POST', headers: { ...clientHeaders, 'X-CSRF-Token': clientPayload.csrfToken },
    });
    assert.equal(clientLogout.status, 200);
    assert.equal((await fetch(`${baseUrl}/api/client-portal/projects`, { headers: clientHeaders })).status, 401);

    const revoke = await fetch(`${baseUrl}/api/admin/client-projects/companies/${companyA.id}/access-code`, {
      method: 'DELETE', headers: adminHeaders,
    });
    assert.equal(revoke.status, 200);

    const adminLogout = await fetch(`${baseUrl}/api/admin/logout`, {
      method: 'POST', headers: { Cookie: adminCookie, 'X-CSRF-Token': loginPayload.csrfToken },
    });
    assert.equal(adminLogout.status, 200);
    assert.equal((await fetch(`${baseUrl}/api/admin/session`, { headers: { Cookie: adminCookie } })).status, 401);
  } finally {
    await stopIsolatedServer(child);
    await dbModule.closeDatabase();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    delete process.env.SQLITE_PATH;
    await fs.rm(directory, { recursive: true, force: true });
  }
});
