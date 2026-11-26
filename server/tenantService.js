import { getDb } from './db.js';

const db = getDb();

export async function createBusiness({ id, name, type, language, status = 'active', botEnabled = 1 }) {
  const tenantId = id || crypto.randomUUID();

  await db.prepare(`
    INSERT INTO businesses (id, name, type, status, language, bot_enabled)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING
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

export async function getBusinessById(id) {
  return (await db.prepare('SELECT * FROM businesses WHERE id = ?').get(id)) || null;
}

export async function listBusinesses() {
  return db.prepare('SELECT * FROM businesses ORDER BY created_at DESC').all();
}
