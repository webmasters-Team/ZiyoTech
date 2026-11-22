import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

test('async services preserve auth, business, and analytics behavior on an isolated SQLite database', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ziyotech-pg-migration-'));
  const sqlitePath = path.join(directory, 'test.db');
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const { initializeDatabase, getDb, closeDatabase, convertPlaceholders } = await import('../db.js');
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  await assert.rejects(initializeDatabase(), /Production requires DATABASE_URL and PostgreSQL/);
  await closeDatabase();
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  await initializeDatabase({ forceSqlite: true, sqlitePath, seedDemoData: false });
  const db = getDb();

  try {
    assert.equal(convertPlaceholders("SELECT '?' AS camelCase, ? AS anotherValue -- ?"), "SELECT '?' AS \"camelCase\", $1 AS \"anotherValue\" -- ?");
    assert.equal(convertPlaceholders("SELECT 'literal AS value' AS output"), "SELECT 'literal AS value' AS \"output\"");
    await db.prepare(`INSERT INTO businesses (id, name) VALUES (?, ?)`).run('test-business', 'Test Business');
    await db.prepare(`INSERT INTO user_accounts (id, email, full_name, auth_provider, email_verified, role)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run('admin-test', 'admin@example.test', 'Test Admin', 'password', 1, 'admin');

    const auth = await import('../adminAuthService.js');
    const { passwordSalt, passwordHash } = await auth.hashAdminPassword('test-password');
    await auth.saveAdminCredential({ accountId: 'admin-test', username: 'TestAdmin', passwordSalt, passwordHash });
    assert.equal((await auth.verifyAdminCredentials('testadmin', 'test-password')).id, 'admin-test');
    assert.equal(await auth.verifyAdminCredentials('testadmin', 'wrong-password'), null);
    const session = await auth.issueAdminSession('admin-test');
    const storedSession = await auth.getAdminSession(session.token);
    assert.equal(storedSession.user.email, 'admin@example.test');
    assert.equal(auth.verifyAdminCsrf(storedSession, session.csrfToken), true);
    assert.equal(auth.verifyAdminCsrf(storedSession, '0'.repeat(64)), false);
    await auth.revokeAdminSession(session.token);
    assert.equal(await auth.getAdminSession(session.token), null);

    const business = await import('../businessService.js');
    const product = await business.createProduct({ businessId: 'test-business', name: 'Test Product', price: 500 });
    assert.equal(product.name, 'Test Product');
    assert.equal((await business.listProducts('test-business')).length, 1);
    const conversation = await business.addConversation({ businessId: 'test-business', customerName: 'Visitor' });
    await business.addConversationMessage({ businessId: 'test-business', conversationId: conversation.id, role: 'user', text: 'Hello' });
    assert.equal((await business.listConversationMessages('test-business', conversation.id))[0].text, 'Hello');
    assert.equal((await db.prepare('SELECT last_message FROM conversations WHERE id = ?').get(conversation.id)).last_message, 'Hello');
    await business.addLead({ businessId: 'test-business', customerName: 'Visitor', phone: '555' });
    assert.equal((await business.listLeads('test-business')).length, 1);

    const analytics = await import('../visitorAnalyticsService.js');
    const started = await analytics.startAnalyticsSession({ device: 'desktop', browser: 'chrome', visible: true, active: true });
    assert.equal(typeof started.visitorId, 'string');
    const resumed = await analytics.startAnalyticsSession({ visitorId: started.visitorId, device: 'desktop', browser: 'chrome', visible: true, active: true });
    assert.equal(resumed.sessionId, started.sessionId);
    assert.equal(resumed.resumed, true);
    assert.equal(await analytics.recordPageView({ ...started, eventId: 'eeeeeeeeeeeeeeee', pagePath: '/pricing' }), true);
    assert.equal(await analytics.recordPageView({ ...started, eventId: 'eeeeeeeeeeeeeeee', pagePath: '/pricing' }), false);
    const overview = await analytics.getAnalyticsOverview();
    assert.equal(overview.totals.guestVisitors, 1);
    assert.equal(overview.totals.pageViews, 1);
    const charts = await analytics.getAnalyticsCharts({ range: '24h' });
    assert.equal(charts.range, '24h');
    assert.equal(charts.topPages[0].pagePath, '/pricing');
    const guests = await analytics.listGuestVisitors({});
    assert.equal(guests.total, 1);
  } finally {
    await closeDatabase();
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    await fs.rm(directory, { recursive: true, force: true });
  }
});
