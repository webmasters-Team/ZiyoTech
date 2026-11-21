import crypto from 'node:crypto';
import { getDb } from './db.js';

const db = getDb();
const FIREBASE_CERTS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
let cachedKeys = null;
let cachedKeysUntil = 0;

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const safeGooglePhotoUrl = (value) => {
  if (typeof value !== 'string' || value.length > 1000) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port
      || !(url.hostname === 'googleusercontent.com' || url.hostname.endsWith('.googleusercontent.com'))) return null;
    return url.toString();
  } catch {
    return null;
  }
};

async function lookupGoogleProfilePhoto(idToken, uid, email, fetchImpl) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return { photoUrl: null, resolved: false };

  try {
    const response = await fetchImpl(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return { photoUrl: null, resolved: false };

    const payload = await response.json();
    const account = Array.isArray(payload.users) ? payload.users.find((user) => user.localId === uid) : null;
    if (!account || String(account.email || '').trim().toLowerCase() !== email) {
      return { photoUrl: null, resolved: false };
    }

    const googleProvider = Array.isArray(account.providerUserInfo)
      ? account.providerUserInfo.find((provider) => provider.providerId === 'google.com')
      : null;
    if (!googleProvider) return { photoUrl: null, resolved: false };

    return {
      photoUrl: safeGooglePhotoUrl(googleProvider.photoUrl) || safeGooglePhotoUrl(account.photoUrl),
      resolved: true,
    };
  } catch {
    // Photo lookup must not prevent otherwise valid sign-in if Firebase's lookup API is unavailable.
    return { photoUrl: null, resolved: false };
  }
}
const safeProfile = (row) => row && ({
  id: row.id,
  email: row.email,
  displayName: row.full_name,
  photoUrl: row.photo_url,
  provider: row.auth_provider,
  emailVerified: Boolean(row.email_verified),
  registeredAt: row.registered_at,
  lastLoginAt: row.last_login_at,
});

async function getFirebaseKeys(fetchImpl) {
  if (cachedKeys && Date.now() < cachedKeysUntil) return cachedKeys;
  let response;
  try {
    response = await fetchImpl(FIREBASE_CERTS_URL, { headers: { Accept: 'application/json' } });
  } catch {
    const error = new Error('Identity provider is temporarily unavailable.');
    error.statusCode = 503;
    throw error;
  }
  if (!response.ok) {
    const error = new Error('Unable to validate identity provider token.');
    error.statusCode = 503;
    throw error;
  }
  const body = await response.json();
  if (!Array.isArray(body.keys)) throw new Error('Identity provider returned invalid signing keys.');
  const maxAge = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/i)?.[1] || 300);
  cachedKeys = body.keys;
  cachedKeysUntil = Date.now() + Math.max(60, Math.min(maxAge, 3600)) * 1000;
  return cachedKeys;
}

export async function verifyFirebaseIdToken(token, {
  projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.VITE_FIREBASE_PROJECT_ID
    && process.env.FIREBASE_PROJECT_ID !== process.env.VITE_FIREBASE_PROJECT_ID) {
    const error = new Error('Firebase project configuration mismatch: FIREBASE_PROJECT_ID must match VITE_FIREBASE_PROJECT_ID.');
    error.statusCode = 503;
    throw error;
  }
  if (!projectId) {
    const error = new Error('Firebase project configuration is missing on the server.');
    error.statusCode = 503;
    throw error;
  }
  if (typeof token !== 'string' || token.length > 10000) throw new Error('A valid identity token is required.');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Identity token is malformed.');
  let header;
  let claims;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw new Error('Identity token is malformed.');
  }
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Identity token uses an unsupported signature.');
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Identity token was issued for another project.');
  }
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(claims.exp) || claims.exp <= now || !Number.isInteger(claims.iat) || claims.iat > now + 60
    || !Number.isInteger(claims.auth_time) || claims.auth_time > now + 60) {
    throw new Error('Identity token has expired or has invalid timestamps.');
  }
  if (typeof claims.sub !== 'string' || claims.sub.length < 1 || claims.sub.length > 128) {
    throw new Error('Identity token has no valid account identifier.');
  }

  const keys = await getFirebaseKeys(fetchImpl);
  const jwk = keys.find((key) => key.kid === header.kid && key.kty === 'RSA' && key.use === 'sig');
  if (!jwk) throw new Error('Identity token signing key is not recognized.');
  const signature = Buffer.from(parts[2], 'base64url');
  const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`);
  const valid = crypto.verify('RSA-SHA256', signedContent, crypto.createPublicKey({ key: jwk, format: 'jwk' }), signature);
  if (!valid) throw new Error('Identity token signature is invalid.');

  if (typeof claims.email !== 'string' || !claims.email.includes('@')) throw new Error('A verified email address is required.');
  const provider = claims.firebase?.sign_in_provider;
  if (!['password', 'google.com'].includes(provider)) throw new Error('Identity token has no supported sign-in provider.');
  const identity = {
    uid: claims.sub,
    email: claims.email.trim().toLowerCase(),
    emailVerified: claims.email_verified === true,
    displayName: typeof claims.name === 'string' ? claims.name.slice(0, 100) : '',
    photoUrl: safeGooglePhotoUrl(claims.picture),
    provider,
    photoUrlResolved: false,
  };

  if (identity.photoUrl) {
    identity.photoUrlResolved = true;
  } else if (provider === 'google.com') {
    const photo = await lookupGoogleProfilePhoto(token, identity.uid, identity.email, fetchImpl);
    identity.photoUrl = photo.photoUrl;
    identity.photoUrlResolved = photo.resolved;
  }

  return identity;
}

export function syncFirebaseProfile(identity) {
  const existing = db.prepare('SELECT account_status FROM user_accounts WHERE id = ?').get(identity.uid);
  if (existing && existing.account_status !== 'ACTIVE') {
    const error = new Error('This account is disabled. Contact ZiyoTech support.');
    error.statusCode = 403;
    throw error;
  }

  try {
    db.prepare(`
      INSERT INTO user_accounts (id, email, full_name, photo_url, auth_provider, email_verified, role)
      VALUES (@uid, @email, @displayName, @photoUrl, @provider, @emailVerified, 'user')
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        full_name = CASE WHEN user_accounts.full_name = '' THEN excluded.full_name ELSE user_accounts.full_name END,
        photo_url = CASE WHEN excluded.auth_provider = 'google.com' AND @photoUrlResolved = 1 THEN excluded.photo_url ELSE user_accounts.photo_url END,
        auth_provider = excluded.auth_provider,
        email_verified = excluded.email_verified
    `).run({
      ...identity,
      emailVerified: identity.emailVerified ? 1 : 0,
      photoUrlResolved: identity.photoUrlResolved ? 1 : 0,
    });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const conflict = new Error('An account already uses this email with a different sign-in method. Sign in with that method; accounts are not merged automatically.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }

  return safeProfile(db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(identity.uid));
}

export function createUserSession(uid) {
  const user = db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(uid);
  if (!user || user.account_status !== 'ACTIVE') {
    const error = new Error('This account is unavailable.');
    error.statusCode = 403;
    throw error;
  }
  if (!user.email_verified) {
    const error = new Error('Verify your email address before signing in.');
    error.statusCode = 403;
    error.code = 'EMAIL_NOT_VERIFIED';
    throw error;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const create = db.transaction(() => {
    db.prepare('DELETE FROM user_sessions WHERE expires_at <= ?').run(new Date().toISOString());
    db.prepare('INSERT INTO user_sessions (token_hash, user_id, csrf_hash, expires_at) VALUES (?, ?, ?, ?)')
      .run(hash(token), uid, hash(csrfToken), expiresAt);
    db.prepare('UPDATE user_accounts SET last_login_at = ? WHERE id = ?').run(new Date().toISOString(), uid);
  });
  create();
  return { token, csrfToken, expiresAt, user: safeProfile({ ...user, last_login_at: new Date().toISOString() }) };
}

export function getUserSession(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const session = db.prepare(`
    SELECT s.token_hash, s.csrf_hash, s.expires_at, u.*
    FROM user_sessions s JOIN user_accounts u ON u.id = s.user_id
    WHERE s.token_hash = ?
  `).get(hash(token));
  if (!session) return null;
  if (session.expires_at <= new Date().toISOString() || session.account_status !== 'ACTIVE' || !session.email_verified) {
    db.prepare('DELETE FROM user_sessions WHERE token_hash = ?').run(session.token_hash);
    return null;
  }
  return { user: safeProfile(session), csrfHash: session.csrf_hash, tokenHash: session.token_hash };
}

export function verifyCsrfToken(session, suppliedToken) {
  if (typeof suppliedToken !== 'string' || !/^[a-f0-9]{64}$/i.test(suppliedToken)) return false;
  const expected = Buffer.from(session.csrfHash, 'hex');
  const supplied = Buffer.from(hash(suppliedToken), 'hex');
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export function updateUserProfile(uid, { displayName }) {
  const name = typeof displayName === 'string' ? displayName.trim() : '';
  if (!name || name.length > 100) {
    const error = new Error('Display name must contain between 1 and 100 characters.');
    error.statusCode = 400;
    throw error;
  }
  db.prepare('UPDATE user_accounts SET full_name = ? WHERE id = ? AND account_status = \'ACTIVE\'').run(name, uid);
  return safeProfile(db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(uid));
}

export function isProvisionedAdministrator(uid) {
  if (typeof uid !== 'string' || !uid) return false;
  return db.prepare('SELECT 1 FROM user_accounts WHERE id = ? AND role = \'admin\' AND account_status = \'ACTIVE\'').get(uid) !== undefined;
}

export function revokeUserSession(token) {
  if (typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token)) {
    db.prepare('DELETE FROM user_sessions WHERE token_hash = ?').run(hash(token));
  }
}
