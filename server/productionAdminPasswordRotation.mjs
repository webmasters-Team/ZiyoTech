import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createPostgresPool } from './db.js';
import { getSupabaseProjectReference, isProtectedProductionProject } from './databaseTargetGuard.js';

const scrypt = promisify(crypto.scrypt);
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };
const ROTATION_AUTHORIZATION = 'YES';
const isEmailVerified = (value) => value === true || Number(value) === 1;

export function matchesConfirmation(expected, supplied) {
  return typeof supplied === 'string' && supplied === expected;
}

export function validateProductionRotationTarget({ databaseUrl, expectedProjectRef, authorization, productionRuntime }) {
  if (authorization !== ROTATION_AUTHORIZATION) throw new Error('Explicit production rotation authorization is required.');
  if (!productionRuntime) throw new Error('This command must run in an explicitly marked production operations environment.');
  const actualProjectRef = getSupabaseProjectReference(databaseUrl);
  if (!actualProjectRef || !expectedProjectRef || actualProjectRef !== expectedProjectRef.toLowerCase()) {
    throw new Error('The database project does not match the explicitly confirmed production target.');
  }
  if (!isProtectedProductionProject(actualProjectRef)) {
    throw new Error('The database project is not in the protected production allowlist.');
  }
  return actualProjectRef;
}

export function validatePassword(password, confirmation) {
  if (typeof password !== 'string' || password.length < 14) throw new Error('The new password must contain at least 14 characters.');
  if (password !== confirmation) throw new Error('The password confirmation does not match.');
  return true;
}

export async function deriveAdminPasswordVerifier(password, salt = crypto.randomBytes(16)) {
  const passwordHash = await scrypt(password, salt, 64, SCRYPT_OPTIONS);
  return { passwordSalt: salt.toString('hex'), passwordHash: passwordHash.toString('hex'), hashParams: 'scrypt-N32768-r8-p1' };
}

export async function rotateExistingAdministrator(client, { accountId, username, passwordSalt, passwordHash, hashParams }) {
  await client.query('BEGIN');
  try {
    const target = await client.query(`SELECT u.id, u.role, u.account_status, u.email_verified, u.auth_provider, c.username
      FROM user_accounts u JOIN admin_credentials c ON c.account_id = u.id
      WHERE u.id = $1 AND LOWER(c.username) = LOWER($2)
      FOR UPDATE OF u, c`, [accountId, username]);
    const account = target.rows[0];
    if (!account || account.role !== 'admin' || account.account_status !== 'ACTIVE' || !isEmailVerified(account.email_verified)) {
      throw new Error('The confirmed account is not an existing active, verified administrator with a configured credential.');
    }

    const updated = await client.query(`UPDATE admin_credentials
      SET password_salt = $1, password_hash = $2, hash_params = $3, updated_at = CURRENT_TIMESTAMP
      WHERE account_id = $4 AND LOWER(username) = LOWER($5)`,
    [passwordSalt, passwordHash, hashParams, accountId, username]);
    if (updated.rowCount !== 1) throw new Error('The existing administrator credential changed during confirmation.');

    const adminSessions = await client.query('DELETE FROM admin_sessions WHERE account_id = $1', [accountId]);
    const userSessions = await client.query('DELETE FROM user_sessions WHERE user_id = $1', [accountId]);
    await client.query('COMMIT');
    return {
      authProvider: account.auth_provider,
      adminSessionsRevoked: adminSessions.rowCount,
      userSessionsRevoked: userSessions.rowCount,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function ask(label) {
  const prompt = readline.createInterface({ input: stdin, output: stdout });
  try { return (await prompt.question(label)).trim(); }
  finally { prompt.close(); }
}

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      reject(new Error('Run this command from an interactive terminal so password input can remain hidden.'));
      return;
    }
    stdout.write(label);
    let value = '';
    const cleanup = () => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === '\u0003') { cleanup(); reject(new Error('Rotation cancelled.')); return; }
        if (character === '\r' || character === '\n') { cleanup(); resolve(value); return; }
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character !== '\u001b' && character >= ' ') value += character;
      }
    };
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

function readExpectedProjectRef(args) {
  if (args.length !== 1 || !args[0].startsWith('--expected-project-ref=')) {
    throw new Error('Usage: node server/productionAdminPasswordRotation.mjs --expected-project-ref=<confirmed-production-project-ref>');
  }
  const value = args[0].slice('--expected-project-ref='.length).toLowerCase();
  if (!/^[a-z0-9]{12,32}$/.test(value)) throw new Error('A valid expected production project reference is required.');
  return value;
}

async function main() {
  const expectedProjectRef = readExpectedProjectRef(process.argv.slice(2));
  const productionRuntime = process.env.NODE_ENV === 'production'
    && Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
  const projectRef = validateProductionRotationTarget({
    databaseUrl: process.env.DATABASE_URL,
    expectedProjectRef,
    authorization: process.env.ZIYOTECH_ALLOW_PRODUCTION_ADMIN_ROTATION,
    productionRuntime,
  });
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') throw new Error('An interactive terminal is required. No noninteractive password input is supported.');

  const authorizePhrase = `AUTHORIZE LIVE ADMIN ROTATION ${projectRef}`;
  if (!matchesConfirmation(authorizePhrase, await ask(`Type exactly "${authorizePhrase}" to continue: `))) throw new Error('Production target authorization did not match.');

  let pool;
  try {
    pool = await createPostgresPool(process.env.DATABASE_URL);
    const client = await pool.connect();
    try {
      const identity = await client.query('SELECT current_database() AS database_name');
      const databaseName = String(identity.rows[0]?.database_name || '');
      if (!databaseName) throw new Error('The connected database name could not be verified.');
      const databasePhrase = `CONFIRM DATABASE ${projectRef} ${databaseName}`;
      if (!matchesConfirmation(databasePhrase, await ask(`Connected target is ${projectRef}/${databaseName}. Type exactly "${databasePhrase}": `))) {
        throw new Error('Production database confirmation did not match.');
      }

      const username = await ask('Existing Admin ID: ');
      const accountId = await ask('Existing administrator account ID: ');
      if (!/^[A-Za-z0-9._-]{3,80}$/.test(username) || !accountId || accountId.length > 128) {
        throw new Error('A valid existing Admin ID and account ID are required.');
      }
      const found = await client.query(`SELECT u.id, u.role, u.account_status, u.email_verified, u.auth_provider
        FROM user_accounts u JOIN admin_credentials c ON c.account_id = u.id
        WHERE u.id = $1 AND LOWER(c.username) = LOWER($2)`, [accountId, username]);
      const account = found.rows[0];
      if (!account || account.role !== 'admin' || account.account_status !== 'ACTIVE' || !isEmailVerified(account.email_verified)) {
        throw new Error('That exact account is not an existing active, verified administrator with a configured credential.');
      }
      if (!['password', 'google.com'].includes(account.auth_provider)) {
        throw new Error('The administrator has an unknown identity provider; refusing to rotate without provider-specific revocation review.');
      }
      const adminPhrase = `CONFIRM ADMIN ${username} ${accountId}`;
      if (!matchesConfirmation(adminPhrase, await ask(`Type exactly "${adminPhrase}" to confirm the account: `))) throw new Error('Administrator confirmation did not match.');

      if (['password', 'google.com'].includes(account.auth_provider)) {
        stdout.write('This account also uses Firebase authentication. Before continuing, revoke its Firebase refresh tokens through an authorized Firebase Admin SDK operation. The backend will reject Firebase ID tokens authenticated before this password rotation. This script does not change the Firebase sign-in credential.\n');
        const firebasePhrase = `FIREBASE REFRESH TOKENS REVOKED ${accountId}`;
        if (!matchesConfirmation(firebasePhrase, await ask(`After completing that external action, type exactly "${firebasePhrase}": `))) {
          throw new Error('Firebase token revocation was not confirmed; rotation stopped.');
        }
      }

      const password = await hiddenPrompt('New Admin ID password (minimum 14 characters): ');
      const confirmation = await hiddenPrompt('Confirm new password: ');
      validatePassword(password, confirmation);
      if (password.toLowerCase() === username.toLowerCase()) throw new Error('The password must differ from the Admin ID.');
      const verifier = await deriveAdminPasswordVerifier(password);
      const result = await rotateExistingAdministrator(client, { accountId, username, ...verifier });
      stdout.write(`Rotation completed for the confirmed administrator. Revoked ${result.adminSessionsRevoked} admin sessions and ${result.userSessionsRevoked} user sessions.\n`);
      if (['password', 'google.com'].includes(result.authProvider)) {
        stdout.write('Firebase refresh-token revocation was an operator-confirmed prerequisite; the Firebase sign-in credential itself is not changed by this script.\n');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof Error && !error.code) throw error;
    throw new Error('Production administrator rotation failed safely. No credentials or connection details were logged.');
  } finally {
    await pool?.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(() => {
    stdout.write('Production administrator rotation stopped safely. No credential or connection details were logged.\n');
    process.exitCode = 1;
  });
}
