import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseDotenv } from 'dotenv';
import { assertNonProductionDatabaseTarget } from '../server/databaseTargetGuard.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendPort = 3000;
const backendPort = 4001;
const frontendOrigin = `http://localhost:${frontendPort}`;
const backendOrigin = `http://localhost:${backendPort}`;
const children = new Set();
let stopping = false;
let signalResolve;
const receivedSignal = new Promise((resolve) => { signalResolve = resolve; });

function assertDevelopmentDatabaseTarget() {
  const envPath = path.join(projectRoot, '.env.supabase.local');
  let localEnv;
  try {
    localEnv = parseDotenv(readFileSync(envPath));
  } catch {
    throw new Error('Cannot read the ignored .env.supabase.local development configuration. Backend startup stopped.');
  }

  const databaseUrl = process.env.DATABASE_URL || localEnv.DATABASE_URL;
  assertNonProductionDatabaseTarget({
    databaseUrl,
    allowedProjectRef: process.env.ZIYOTECH_NONPRODUCTION_PROJECT_REF || localEnv.ZIYOTECH_NONPRODUCTION_PROJECT_REF,
    allowDatabaseAccess: process.env.ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE || localEnv.ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE,
    productionRuntime: Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.NODE_ENV === 'production'),
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 900) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function canBind(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
  });
}

async function assertNoOldFrontendInstances() {
  const detectedPorts = [];
  for (const port of [3001, 3002]) {
    const response = await fetchWithTimeout(`http://localhost:${port}/`);
    if (!response) continue;
    const html = await response.text().catch(() => '');
    if (/<title[^>]*>\s*ZiyoTech\s*-\s*Digital Agency/i.test(html)) detectedPorts.push(port);
  }
  if (detectedPorts.length) {
    throw new Error(`ZiyoTech frontends are already responding on localhost:${detectedPorts.join(', ')}. Close them from their owning terminals before starting the single-port setup; this script will not terminate unidentified processes.`);
  }
}

async function inspectExistingBackend() {
  const health = await fetchWithTimeout(`${backendOrigin}/api/health`);
  if (health) {
    const body = await health.json().catch(() => null);
    if (health.ok && body?.ok === true && body?.service === 'ziyo-tech-sales-ai') {
      const session = await fetchWithTimeout(`${backendOrigin}/api/admin/session`, {
        headers: { Origin: frontendOrigin },
      });
      const allowedOrigin = session?.headers.get('access-control-allow-origin');
      const json = session?.headers.get('content-type')?.includes('application/json');
      if (!session || allowedOrigin !== frontendOrigin || !json || ![200, 401].includes(session.status)) {
        throw new Error('A ZiyoTech API responds on localhost:4001, but its localhost:3000 credentialed auth/CORS check failed. Resolve that backend before starting the frontend.');
      }
      throw new Error('A healthy ZiyoTech API already responds on localhost:4001. Close it from its owning terminal so this command can start and manage the current backend; this script will not reuse or terminate an unidentified process.');
    }
  }

  if (!(await canBind(backendPort))) {
    throw new Error('Port 4001 is occupied by a service that did not pass the ZiyoTech API health check. It was left untouched.');
  }
  return startBackend();
}

function startChild(name, command, args, env) {
  const child = spawn(command, args, { cwd: projectRoot, env, stdio: 'inherit', windowsHide: true });
  child.devServerName = name;
  child.exitResult = new Promise((resolve) => child.once('exit', (code, signal) => resolve({ code, signal })));
  child.once('error', (error) => {
    console.error(`${name} could not start: ${error.message}`);
  });
  children.add(child);
  return child;
}

function startBackend() {
  console.log('Starting the PostgreSQL backend with verified nonproduction configuration…');
  return startChild('Backend', process.execPath, [path.join(projectRoot, 'server', 'index.js')], {
    ...process.env,
    NODE_ENV: 'development',
    HOST: 'localhost',
    PORT: String(backendPort),
  });
}

async function waitForBackend(child) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('The backend exited before its health check passed. Review the backend startup output above.');
    const response = await fetchWithTimeout(`${backendOrigin}/api/health`, {}, 1200);
    const body = await response?.json().catch(() => null);
    if (response?.ok && body?.ok === true && body?.service === 'ziyo-tech-sales-ai') {
      console.log(`Backend ready: ${backendOrigin}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Backend did not become healthy on localhost:4001 within 45 seconds.');
}

async function stopChildren() {
  if (stopping) return;
  stopping = true;
  const ownedChildren = [...children].reverse();
  for (const child of ownedChildren) {
    if (child.exitCode !== null || child.killed) continue;
    child.kill('SIGTERM');
  }
  await Promise.all(ownedChildren.map(async (child) => {
    if (child.exitCode !== null) return;
    await Promise.race([
      child.exitResult,
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }));
  console.log('ZiyoTech development processes started by this command have stopped.');
}

process.on('SIGINT', () => signalResolve('SIGINT'));
process.on('SIGTERM', () => signalResolve('SIGTERM'));

try {
  assertDevelopmentDatabaseTarget();
  await assertNoOldFrontendInstances();
  if (!(await canBind(frontendPort))) {
    throw new Error('Port 3000 is occupied. Stop the application using localhost:3000, then run npm run dev again. No fallback port will be used.');
  }

  const backendChild = await inspectExistingBackend();
  await waitForBackend(backendChild);

  console.log('Starting the Vite frontend in strict-port mode…');
  const viteChild = startChild('Frontend', process.execPath, [
    path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
    '--host', 'localhost', '--port', String(frontendPort), '--strictPort',
  ], { ...process.env, NODE_ENV: 'development' });

  const frontendReadyDeadline = Date.now() + 20_000;
  let frontendReady = false;
  while (Date.now() < frontendReadyDeadline) {
    if (viteChild.exitCode !== null) throw new Error('The frontend exited before it became available. Check the Vite output above.');
    const response = await fetchWithTimeout(`${frontendOrigin}/`);
    if (response?.ok) {
      frontendReady = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!frontendReady) throw new Error('The frontend did not become available on localhost:3000.');

  console.log(`Frontend ready: ${frontendOrigin}`);
  console.log(`Admin panel:    ${frontendOrigin}/admin`);
  console.log(`Backend API:    ${backendOrigin}`);
  console.log('Press Ctrl+C to stop the processes started by this command.');

  const winner = await Promise.race([
    receivedSignal.then((signal) => ({ type: 'signal', signal })),
    ...[...children].map((child) => child.exitResult.then((result) => ({ type: 'exit', child, result }))),
  ]);
  if (winner.type === 'signal') console.log(`Received ${winner.signal}; stopping managed development processes…`);
  else if (!stopping) console.error(`${winner.child.devServerName} exited unexpectedly (code ${winner.result.code ?? winner.result.signal}).`);
  await stopChildren();
  if (winner.type === 'exit' && winner.result.code !== 0) process.exitCode = winner.result.code || 1;
} catch (error) {
  console.error(`\nZiyoTech development startup failed: ${error.message}`);
  await stopChildren();
  process.exitCode = 1;
}
