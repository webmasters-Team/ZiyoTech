import { getDb } from './db.js';

const db = getDb();

export function createBusiness({ id, name, type, language, status = 'active', botEnabled = 1 }) {
  const tenantId = id || crypto.randomUUID();

  db.prepare(`
    INSERT OR IGNORE INTO businesses (id, name, type, status, language, bot_enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    tenantId,
    name,
    type || 'retail',
    status,
    language || 'uz',
    botEnabled ? 1 : 0,
  );

  return getBusinessById(tenantId);
}

export function getBusinessById(id) {
  return db.prepare('SELECT * FROM businesses WHERE id = ?').get(id) || null;
}

export function listBusinesses() {
  return db.prepare('SELECT * FROM businesses ORDER BY created_at DESC').all();
}
