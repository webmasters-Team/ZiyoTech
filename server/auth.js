import crypto from 'crypto';

const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const ADMIN_SESSIONS = new Map();

const LEGACY_SESSION_TOKENS = {
  'demo-session': {
    userId: 'admin-1',
    email: 'admin@ziyotech.com',
    role: 'admin',
    expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
  },
  'firebase-session': {
    userId: 'admin-1',
    email: 'admin@ziyotech.com',
    role: 'admin',
    expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
  },
};

for (const [token, session] of Object.entries(LEGACY_SESSION_TOKENS)) {
  ADMIN_SESSIONS.set(token, session);
}

const ADMIN_USERS = [
  {
    id: 'admin-1',
    email: 'admin@ziyotech.com',
    passwordHash: crypto.createHash('sha256').update('Aslan1995!').digest('hex'),
    role: 'admin',
  },
];

export function verifyAdminCredentials(email, password) {
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  return ADMIN_USERS.some(
    (user) => user.email === email && user.passwordHash === passwordHash,
  );
}

export function getAdminSessionPayload(email) {
  const user = ADMIN_USERS.find((entry) => entry.email === email);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export function issueAdminSession(email) {
  const user = ADMIN_USERS.find((entry) => entry.email === email);
  if (!user) return null;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;

  ADMIN_SESSIONS.set(token, {
    email: user.email,
    role: user.role,
    userId: user.id,
    expiresAt,
  });

  return {
    token,
    expiresAt,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const session = ADMIN_SESSIONS.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    ADMIN_SESSIONS.delete(token);
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    role: session.role,
    expiresAt: session.expiresAt,
  };
}

export function revokeAdminSession(token) {
  if (token) {
    ADMIN_SESSIONS.delete(token);
  }
}
