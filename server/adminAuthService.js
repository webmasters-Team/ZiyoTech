import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { getDatabaseDialect, getDb } from './db.js';

const db = getDb();
const scrypt = promisify(crypto.scrypt);
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const DUMMY_SALT = Buffer.alloc(16, 0x5a);
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

export async function getActiveAdminAccounts() {
  return db.prepare(`SELECT id FROM user_accounts WHERE role = 'admin' AND account_status = 'ACTIVE' AND email_verified = 1 ORDER BY registered_at`).all();
}

export async function getAdminCredentialState(accountId) {
  return await db.prepare('SELECT username, updated_at AS updatedAt FROM admin_credentials WHERE account_id = ?').get(accountId) || null;
}

export async function isAdminCredentialConfigured() {
  return (await db.prepare('SELECT 1 FROM admin_credentials LIMIT 1').get()) !== undefined;
}

export async function saveAdminCredential({ accountId, username, passwordSalt, passwordHash, replace = false }) {
  const normalizedUsername = String(username || '').trim();
  if (!/^[A-Za-z0-9._-]{3,80}$/.test(normalizedUsername)) throw new Error('Admin ID must be 3–80 characters using letters, numbers, dot, underscore, or hyphen.');
  const account = await db.prepare("SELECT id FROM user_accounts WHERE id = ? AND role = 'admin' AND account_status = 'ACTIVE' AND email_verified = 1").get(accountId);
  if (!account) throw new Error('The selected account is not an active administrator.');
  const existingByAccount = await db.prepare('SELECT account_id, username FROM admin_credentials WHERE account_id = ?').get(accountId);
  const existingByUsername = await db.prepare('SELECT account_id FROM admin_credentials WHERE LOWER(username) = LOWER(?)').get(normalizedUsername);
  if ((existingByAccount || existingByUsername) && !replace) throw new Error('Credentials already exist. Confirm replacement in the setup command before changing them.');
  if (existingByUsername && existingByUsername.account_id !== accountId) throw new Error('That Admin ID is already assigned to another account.');
  const save = db.transaction(async () => {
    if (existingByAccount) {
      await db.prepare(`UPDATE admin_credentials SET username = ?, password_salt = ?, password_hash = ?, hash_params = ?, updated_at = ? WHERE account_id = ?`)
        .run(normalizedUsername, passwordSalt, passwordHash, 'scrypt-N32768-r8-p1', new Date().toISOString(), accountId);
      await db.prepare('DELETE FROM admin_sessions WHERE account_id = ?').run(accountId);
    } else {
      await db.prepare(`INSERT INTO admin_credentials (account_id, username, password_salt, password_hash, hash_params) VALUES (?, ?, ?, ?, ?)`)
        .run(accountId, normalizedUsername, passwordSalt, passwordHash, 'scrypt-N32768-r8-p1');
    }
  });
  await save();
}

export async function verifyAdminCredentials(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 80 || password.length > 1024) return null;
  const credentialVersionExpression = getDatabaseDialect() === 'postgres' ? 'c.updated_at::text' : 'c.updated_at';
  const row = await db.prepare(`SELECT c.account_id, c.password_salt, c.password_hash, c.hash_params,
    ${credentialVersionExpression} AS credential_version, u.email, u.full_name, u.role, u.account_status, u.email_verified
    FROM admin_credentials c JOIN user_accounts u ON u.id = c.account_id
    WHERE LOWER(c.username) = LOWER(?)`).get(username.trim());
  const candidate = await scrypt(password, row ? Buffer.from(row.password_salt, 'hex') : DUMMY_SALT, 64, SCRYPT_OPTIONS);
  if (!row || row.role !== 'admin' || row.account_status !== 'ACTIVE' || row.email_verified !== 1 || row.hash_params !== 'scrypt-N32768-r8-p1') return null;
  const expected = Buffer.from(row.password_hash, 'hex');
  if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) return null;
  return { id: row.account_id, email: row.email, name: row.full_name, credentialVersion: row.credential_version };
}

export async function issueAdminSession(accountId, expectedCredentialVersion) {
  return db.transaction(async () => {
    const credentialVersionExpression = getDatabaseDialect() === 'postgres' ? 'c.updated_at::text' : 'c.updated_at';
    const lockClause = getDatabaseDialect() === 'postgres' ? ' FOR UPDATE OF c' : '';
    const account = await db.prepare(`SELECT u.id, u.email, u.full_name AS name,
        ${credentialVersionExpression} AS credential_version
      FROM user_accounts u JOIN admin_credentials c ON c.account_id = u.id
      WHERE u.id = ? AND u.role = 'admin' AND u.account_status = 'ACTIVE' AND u.email_verified = 1${lockClause}`).get(accountId);
    if (!account || (expectedCredentialVersion !== undefined && account.credential_version !== expectedCredentialVersion)) return null;
    const token = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(new Date().toISOString());
    await db.prepare('INSERT INTO admin_sessions (token_hash, account_id, csrf_hash, expires_at) VALUES (?, ?, ?, ?)')
      .run(hash(token), accountId, hash(csrfToken), expiresAt);
    return { token, csrfToken, expiresAt, user: { id: account.id, email: account.email, name: account.name } };
  })();
}

export async function getAdminSession(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const session = await db.prepare(`SELECT s.token_hash, s.csrf_hash, s.expires_at, u.id, u.email, u.full_name AS name, u.role, u.account_status, u.email_verified
    FROM admin_sessions s JOIN user_accounts u ON u.id = s.account_id WHERE s.token_hash = ?`).get(hash(token));
  if (!session) return null;
  if (session.expires_at <= new Date().toISOString() || session.role !== 'admin' || session.account_status !== 'ACTIVE' || session.email_verified !== 1) {
    await db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(session.token_hash);
    return null;
  }
  return { tokenHash: session.token_hash, csrfHash: session.csrf_hash, user: { id: session.id, email: session.email, name: session.name } };
}

export function verifyAdminCsrf(session, token) {
  if (!session || typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return false;
  const expected = Buffer.from(session.csrfHash, 'hex');
  const supplied = Buffer.from(hash(token), 'hex');
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export async function revokeAdminSession(token) {
  if (typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)) {
    await db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(hash(token));
  }
}

export async function hashAdminPassword(password, salt = crypto.randomBytes(16)) {
  const derived = await scrypt(password, salt, 64, SCRYPT_OPTIONS);
  return { passwordSalt: salt.toString('hex'), passwordHash: derived.toString('hex') };
}
