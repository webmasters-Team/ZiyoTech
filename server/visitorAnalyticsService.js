import crypto from 'crypto';
import { getDb } from './db.js';

export const ANALYTICS_RETENTION_DAYS = 90;
export const AGGREGATE_VISIT_RETENTION_DAYS = 400;
export const ANALYTICS_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const ANALYTICS_ACTIVE_WINDOW_MS = 90 * 1000;
export const ANALYTICS_MAX_HEARTBEAT_GAP_SECONDS = 45;
const HEARTBEAT_MIN_INTERVAL_MS = 10 * 1000;
const MAX_PAGE_PATH = 200;

const db = getDb();

function isoNow() {
  return new Date().toISOString();
}

function validId(value) {
  return typeof value === 'string' && /^[a-f0-9]{48}$/i.test(value);
}

function validEventId(value) {
  return typeof value === 'string' && /^[a-f0-9-]{16,64}$/i.test(value);
}

function normalizeCategory(value, allowed) {
  return allowed.includes(value) ? value : 'unknown';
}

export function normalizeAnalyticsPage(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  const path = value.split(/[?#]/, 1)[0].slice(0, MAX_PAGE_PATH);
  if (!path || /[<>\u0000-\u001f]/.test(path)) return null;
  return path;
}

export function cleanupAnalyticsData(now = Date.now()) {
  const cutoff = new Date(now - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const aggregateCutoff = new Date(now - AGGREGATE_VISIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  aggregateCutoff.setUTCMinutes(0, 0, 0);
  const aggregateCutoffIso = aggregateCutoff.toISOString();
  const cleanup = db.transaction(() => {
    db.prepare(`DELETE FROM analytics_page_views WHERE session_id IN
      (SELECT session_id FROM analytics_sessions WHERE last_seen_at < ?)`).run(cutoff);
    db.prepare(`DELETE FROM analytics_sessions WHERE last_seen_at < ?`).run(cutoff);
    db.prepare(`DELETE FROM analytics_visitors WHERE last_seen_at < ? AND NOT EXISTS (
      SELECT 1 FROM analytics_sessions s WHERE s.visitor_id = analytics_visitors.visitor_id
    )`).run(cutoff);
    db.prepare('DELETE FROM analytics_aggregate_visit_hours WHERE hour_utc < ?').run(aggregateCutoffIso);
  });
  cleanup();
}

// Store only a UTC hourly scalar. Do not accept or persist request identifiers,
// browser details, paths, cookies, or network addresses for this counter.
export function recordAutomaticAggregateVisit(now = Date.now()) {
  const hourUtc = `${new Date(now).toISOString().slice(0, 13)}:00:00.000Z`;
  db.prepare(`INSERT INTO analytics_aggregate_visit_hours (hour_utc, visit_count)
    VALUES (?, 1)
    ON CONFLICT(hour_utc) DO UPDATE SET
      visit_count = analytics_aggregate_visit_hours.visit_count + 1`).run(hourUtc);
}

export function expireInactiveAnalyticsSessions(now = Date.now()) {
  const activityCutoff = new Date(now - ANALYTICS_SESSION_TIMEOUT_MS).toISOString();
  const expired = db.prepare(`SELECT session_id, COALESCE(last_activity_at, started_at) AS activity_at
    FROM analytics_sessions WHERE ended_at IS NULL AND COALESCE(last_activity_at, started_at) <= ?`).all(activityCutoff);
  if (!expired.length) return 0;
  const markEnded = db.prepare('UPDATE analytics_sessions SET ended_at = ? WHERE session_id = ? AND ended_at IS NULL');
  const expire = db.transaction(() => {
    for (const session of expired) {
      const endedAt = new Date(Date.parse(session.activity_at) + ANALYTICS_SESSION_TIMEOUT_MS).toISOString();
      markEnded.run(endedAt, session.session_id);
    }
  });
  expire();
  return expired.length;
}

export function startAnalyticsSession({ visitorId, sessionId, userId = null, device, browser, referralSource, visible = true, active = true }) {
  const now = isoNow();
  const knownVisitorId = validId(visitorId) ? visitorId : crypto.randomBytes(24).toString('hex');
  let currentSessionId = validId(sessionId) ? sessionId : null;
  let prior = currentSessionId
    ? db.prepare('SELECT * FROM analytics_sessions WHERE session_id = ?').get(currentSessionId)
    : null;
  if (!prior && validId(visitorId)) {
    prior = db.prepare(`SELECT * FROM analytics_sessions WHERE visitor_id = ? AND user_id IS ? AND ended_at IS NULL
      ORDER BY started_at DESC LIMIT 1`).get(knownVisitorId, userId);
    if (prior && Date.now() - Date.parse(prior.last_activity_at || prior.started_at) <= ANALYTICS_SESSION_TIMEOUT_MS) currentSessionId = prior.session_id;
    else prior = null;
  }
  const identityChanged = prior && prior.user_id !== userId;
  const expired = prior && Date.now() - Date.parse(prior.last_activity_at || prior.started_at) > ANALYTICS_SESSION_TIMEOUT_MS;
  if (prior && (prior.visitor_id !== knownVisitorId || identityChanged || expired || prior.ended_at)) {
    const endedAt = expired && prior.last_activity_at
      ? new Date(Date.parse(prior.last_activity_at) + ANALYTICS_SESSION_TIMEOUT_MS).toISOString()
      : expired ? new Date(Date.parse(prior.started_at) + ANALYTICS_SESSION_TIMEOUT_MS).toISOString() : now;
    db.prepare('UPDATE analytics_sessions SET ended_at = COALESCE(ended_at, ?) WHERE session_id = ?').run(endedAt, currentSessionId);
    currentSessionId = null;
  }

  const ensureVisitor = db.transaction(() => {
    const existing = db.prepare('SELECT visitor_id FROM analytics_visitors WHERE visitor_id = ?').get(knownVisitorId);
    if (!existing) {
      const visitorNumber = (db.prepare('SELECT COALESCE(MAX(visitor_number), 0) + 1 AS next FROM analytics_visitors').get()).next;
      db.prepare(`INSERT INTO analytics_visitors
        (visitor_id, visitor_number, created_at, last_seen_at, device_category, browser_category, referral_source, country_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`)
        .run(knownVisitorId, visitorNumber, now, now,
          normalizeCategory(device, ['desktop', 'mobile', 'tablet', 'unknown']),
          normalizeCategory(browser, ['chrome', 'safari', 'firefox', 'edge', 'other', 'unknown']),
          normalizeReferral(referralSource));
    } else {
      db.prepare(`UPDATE analytics_visitors SET last_seen_at = ?, device_category = ?, browser_category = ?,
        referral_source = COALESCE(referral_source, ?) WHERE visitor_id = ?`)
        .run(now, normalizeCategory(device, ['desktop', 'mobile', 'tablet', 'unknown']),
          normalizeCategory(browser, ['chrome', 'safari', 'firefox', 'edge', 'other', 'unknown']),
          normalizeReferral(referralSource), knownVisitorId);
    }
    if (!currentSessionId) {
      currentSessionId = crypto.randomBytes(24).toString('hex');
      db.prepare(`INSERT INTO analytics_sessions
        (session_id, visitor_id, user_id, started_at, last_seen_at, last_heartbeat_at, last_activity_at, was_visible, was_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(currentSessionId, knownVisitorId, userId, now, now, now, active ? now : null, visible ? 1 : 0, active && visible ? 1 : 0);
    } else {
      db.prepare(`UPDATE analytics_sessions SET last_seen_at = ?, last_heartbeat_at = ?,
        last_activity_at = CASE WHEN ? = 1 THEN ? ELSE last_activity_at END,
        was_visible = ?, was_active = ?, ended_at = NULL WHERE session_id = ?`)
        .run(now, now, active && visible ? 1 : 0, now, visible ? 1 : 0, active && visible ? 1 : 0, currentSessionId);
    }
  });
  ensureVisitor();
  return { visitorId: knownVisitorId, sessionId: currentSessionId, resumed: Boolean(prior && currentSessionId) };
}

function normalizeReferral(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.hostname.toLowerCase().slice(0, 180) || null;
  } catch { return null; }
}

export function recordPageView({ sessionId, visitorId, eventId, pagePath }) {
  if (!validId(sessionId) || !validId(visitorId) || !validEventId(eventId)) return false;
  const path = normalizeAnalyticsPage(pagePath);
  if (!path) return false;
  const session = db.prepare('SELECT visitor_id, ended_at FROM analytics_sessions WHERE session_id = ?').get(sessionId);
  if (!session || session.visitor_id !== visitorId || session.ended_at) return false;
  const result = db.prepare(`INSERT OR IGNORE INTO analytics_page_views (event_id, session_id, page_path, occurred_at)
    VALUES (?, ?, ?, ?)`).run(eventId, sessionId, path, isoNow());
  return result.changes === 1;
}

export function heartbeatAnalyticsSession({ sessionId, visitorId, userId = null, visible, active }) {
  if (!validId(sessionId) || !validId(visitorId)) return { accepted: false, rotate: false };
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const session = db.prepare('SELECT * FROM analytics_sessions WHERE session_id = ?').get(sessionId);
  if (!session || session.visitor_id !== visitorId || session.ended_at) return { accepted: false, rotate: true };
  const inactivityAnchor = Date.parse(session.last_activity_at || session.started_at);
  if (Number.isFinite(inactivityAnchor) && now - inactivityAnchor > ANALYTICS_SESSION_TIMEOUT_MS) {
    db.prepare('UPDATE analytics_sessions SET ended_at = ? WHERE session_id = ?')
      .run(new Date(inactivityAnchor + ANALYTICS_SESSION_TIMEOUT_MS).toISOString(), sessionId);
    return { accepted: false, rotate: true };
  }
  if (session.user_id !== userId) {
    if (session.user_id === null && userId) {
      db.prepare('UPDATE analytics_sessions SET user_id = ? WHERE session_id = ? AND user_id IS NULL').run(userId, sessionId);
    } else {
      db.prepare('UPDATE analytics_sessions SET ended_at = ? WHERE session_id = ?').run(new Date(now).toISOString(), sessionId);
      return { accepted: false, rotate: true };
    }
  }
  const gapMs = now - Date.parse(session.last_heartbeat_at);
  if (gapMs < HEARTBEAT_MIN_INTERVAL_MS) return { accepted: false, rotate: false };
  const currentVisible = visible === true;
  const currentActive = active === true;
  const addSeconds = session.was_visible && session.was_active && currentVisible && currentActive
    && gapMs > 0 && gapMs <= ANALYTICS_MAX_HEARTBEAT_GAP_SECONDS * 1000
    ? Math.floor(gapMs / 1000)
    : 0;
  db.prepare(`UPDATE analytics_sessions SET active_seconds = active_seconds + ?, last_seen_at = ?, last_heartbeat_at = ?,
    last_activity_at = CASE WHEN ? = 1 THEN ? ELSE last_activity_at END,
    was_visible = ?, was_active = ? WHERE session_id = ?`)
    .run(addSeconds, nowIso, nowIso, currentActive && currentVisible ? 1 : 0, nowIso,
      currentVisible ? 1 : 0, currentActive ? 1 : 0, sessionId);
  db.prepare('UPDATE analytics_visitors SET last_seen_at = ? WHERE visitor_id = ?').run(nowIso, visitorId);
  return { accepted: true, activeSecondsAdded: addSeconds, rotate: gapMs > ANALYTICS_SESSION_TIMEOUT_MS };
}

export function endAnalyticsSession({ sessionId, visitorId }) {
  if (!validId(sessionId) || !validId(visitorId)) return false;
  const now = isoNow();
  return db.prepare(`UPDATE analytics_sessions SET ended_at = COALESCE(ended_at, ?), last_seen_at = ?
    WHERE session_id = ? AND visitor_id = ?`).run(now, now, sessionId, visitorId).changes > 0;
}

function dateFilter(query, alias = 's') {
  const clauses = [];
  const params = [];
  const range = ['24h', '7d', '30d'].includes(query.range) ? query.range : null;
  if (range) {
    const now = new Date();
    const rangeStart = range === '24h'
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (range === '7d' ? 6 : 29)));
    clauses.push(`${alias}.started_at >= ? AND ${alias}.started_at <= ?`);
    params.push(rangeStart.toISOString(), now.toISOString());
  }
  const from = validDate(query.from);
  const toStart = validDate(query.to);
  const to = toStart ? new Date(Date.parse(toStart) + 24 * 60 * 60 * 1000).toISOString() : null;
  if (!range && from) { clauses.push(`${alias}.started_at >= ?`); params.push(from); }
  if (!range && to) { clauses.push(`${alias}.started_at < ?`); params.push(to); }
  return { sql: clauses.length ? `AND ${clauses.join(' AND ')}` : '', params };
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? null : date.toISOString();
}

function floorToUtcHour(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours())).toISOString();
}

function aggregateVisitCount(query, now = Date.now()) {
  const range = ['24h', '7d', '30d'].includes(query.range) ? query.range : null;
  let from = null;
  let to = null;
  const current = new Date(now);
  const nextHour = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), current.getUTCHours() + 1)).toISOString();

  if (range === '24h') from = floorToUtcHour(new Date(now - 24 * 60 * 60 * 1000));
  else if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 6 : 29;
    from = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate() - days)).toISOString();
  } else if (range === null) {
    from = validDate(query.from);
    const toStart = validDate(query.to);
    if (toStart) to = new Date(Date.parse(toStart) + 24 * 60 * 60 * 1000).toISOString();
  }

  const clauses = [];
  const params = [];
  if (from) { clauses.push('hour_utc >= ?'); params.push(from); }
  if (to || range) { clauses.push('hour_utc < ?'); params.push(to || nextHour); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT COALESCE(SUM(visit_count), 0) AS count FROM analytics_aggregate_visit_hours ${where}`).get(...params).count;
}

function pageOptions(query) {
  const page = Math.max(1, Math.min(100000, Number.parseInt(query.page, 10) || 1));
  const pageSize = Math.max(10, Math.min(100, Number.parseInt(query.pageSize, 10) || 25));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function getAnalyticsOverview(query = {}) {
  const filter = dateFilter(query);
  const automaticGuestVisits = aggregateVisitCount(query);
  const activeCutoff = new Date(Date.now() - ANALYTICS_ACTIVE_WINDOW_MS).toISOString();
  const totals = db.prepare(`SELECT
    COUNT(*) AS total_visits,
    COUNT(DISTINCT CASE WHEN user_id IS NULL THEN visitor_id END) + COUNT(DISTINCT user_id) AS total_unique_visitors,
    SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS guest_visits,
    SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) AS authenticated_visits,
    COUNT(DISTINCT CASE WHEN user_id IS NULL AND ended_at IS NULL AND last_seen_at >= ? AND was_visible = 1 AND was_active = 1 THEN visitor_id END) AS active_guests,
    COUNT(DISTINCT CASE WHEN user_id IS NOT NULL AND ended_at IS NULL AND last_seen_at >= ? AND was_visible = 1 AND was_active = 1 THEN user_id END) AS active_registered_users,
    AVG(CASE WHEN user_id IS NULL THEN active_seconds END) AS average_guest_duration,
    AVG(CASE WHEN user_id IS NOT NULL THEN active_seconds END) AS average_authenticated_duration,
    AVG(active_seconds) AS average_session_duration,
    COALESCE(SUM(active_seconds), 0) AS total_active_seconds
    FROM analytics_sessions s WHERE 1=1 ${filter.sql}`).get(activeCutoff, activeCutoff, ...filter.params);
  const guests = db.prepare(`SELECT COUNT(DISTINCT s.visitor_id) AS count FROM analytics_sessions s
    WHERE s.user_id IS NULL ${filter.sql}`).get(...filter.params).count;
  const registered = db.prepare('SELECT COUNT(*) AS count FROM user_accounts').get().count;
  const pageViews = db.prepare(`SELECT COUNT(*) AS count FROM analytics_page_views p JOIN analytics_sessions s USING(session_id)
    WHERE 1=1 ${filter.sql.replaceAll('s.started_at', 's.started_at')}`).get(...filter.params).count;
  const activeSessions = db.prepare(`SELECT COUNT(*) AS count FROM analytics_sessions s
    WHERE ended_at IS NULL AND last_seen_at >= ? AND was_visible = 1 AND was_active = 1`).get(activeCutoff).count;
  return {
    definitions: {
      automaticGuestVisits: 'Approximate UTC-hour aggregate of top-level public page entries. No visitor, session, browser, page-path, or network identifier is stored. Reloads and in-app route changes do not count; separate browser tabs or profiles cannot be deduplicated.',
      totalUniqueVisitors: 'Distinct guest browser IDs plus distinct authenticated account IDs with at least one session in the selected UTC period. These categories are intentionally kept separate.',
      guestVisitors: 'Distinct random browser IDs with at least one anonymous session in the selected date range; not a count of identified people.',
      registeredAccounts: 'Account rows in the user_accounts database table, including accounts without tracked visits.',
      guestVisits: 'Anonymous analytics sessions started in the selected date range.',
      authenticatedVisits: 'Analytics sessions associated with a verified signed-in account.',
      activeVisitors: `Distinct guest browser IDs plus registered account IDs with an active visible session whose latest heartbeat is within ${Math.round(ANALYTICS_ACTIVE_WINDOW_MS / 1000)} seconds.`,
      averageSessionDuration: 'Arithmetic mean of measured active seconds across all guest and authenticated sessions started in the selected period.',
      timeZone: 'All analytics range boundaries and chart buckets use UTC.',
      duration: 'Estimated visible and recently active time, accumulated in bounded heartbeat intervals; it is not exact attention time.',
      guestHistory: 'A browser can have both anonymous and authenticated sessions; only the individual session is associated after sign-in.',
    },
    totals: {
      automaticGuestVisits,
      guestVisitors: guests,
      totalUniqueVisitors: totals.total_unique_visitors || 0,
      registeredAccounts: registered,
      totalVisits: totals.total_visits || 0,
      guestVisits: totals.guest_visits || 0,
      authenticatedVisits: totals.authenticated_visits || 0,
      activeGuests: totals.active_guests || 0,
      activeRegisteredUsers: totals.active_registered_users || 0,
      activeVisitors: (totals.active_guests || 0) + (totals.active_registered_users || 0),
      activeSessions,
      averageGuestDurationSeconds: Math.round(totals.average_guest_duration || 0),
      averageAuthenticatedDurationSeconds: Math.round(totals.average_authenticated_duration || 0),
      averageSessionDurationSeconds: Math.round(totals.average_session_duration || 0),
      pageViews,
      measuredActiveSeconds: totals.total_active_seconds || 0,
    },
  };
}

function analyticsChartRange(query = {}) {
  const range = ['24h', '7d', '30d', 'custom'].includes(query.range) ? query.range : '24h';
  const now = new Date();
  if (range === 'custom') {
    const from = validDate(query.from);
    const toStart = validDate(query.to);
    if (!from || !toStart) return { range, valid: false, from: null, to: null, bucket: 'day' };
    const to = new Date(Date.parse(toStart) + 24 * 60 * 60 * 1000).toISOString();
    if (Date.parse(to) <= Date.parse(from) || Date.parse(to) - Date.parse(from) > 366 * 24 * 60 * 60 * 1000) return { range, valid: false, from, to, bucket: 'day' };
    return { range, valid: true, from, to, bucket: 'day' };
  }
  const from = range === '24h'
    ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (range === '7d' ? 6 : 29)));
  return { range, valid: true, from: from.toISOString(), to: now.toISOString(), bucket: range === '24h' ? 'hour' : 'day' };
}

export function getAnalyticsCharts(query = {}) {
  const selection = analyticsChartRange(query);
  if (!selection.valid) return { range: selection.range, timeZone: 'UTC', error: 'Choose a valid custom date range no longer than 366 days.', traffic: [], hourlyActivity: [], topPages: [], visitorDistribution: { guests: 0, registeredUsers: 0 }, engagementTrend: [] };

  const bucketFormat = selection.bucket === 'hour' ? '%Y-%m-%dT%H:00:00Z' : '%Y-%m-%d';
  const trafficRows = db.prepare(`SELECT strftime(?, s.started_at) AS bucket,
    SUM(CASE WHEN s.user_id IS NULL THEN 1 ELSE 0 END) AS guestVisits,
    SUM(CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END) AS authenticatedVisits,
    COUNT(*) AS visits, ROUND(AVG(s.active_seconds), 0) AS averageActiveSeconds
    FROM analytics_sessions s WHERE s.started_at >= ? AND s.started_at < ?
    GROUP BY bucket ORDER BY bucket`).all(bucketFormat, selection.from, selection.to);
  const trafficByBucket = new Map(trafficRows.map((row) => [row.bucket, row]));
  const bucketCount = selection.range === '24h' ? 24 : selection.range === '7d' ? 7 : selection.range === '30d' ? 30
    : Math.min(367, Math.max(1, Math.ceil((Date.parse(selection.to) - Date.parse(selection.from)) / (24 * 60 * 60 * 1000))));
  const traffic = trafficRows.length ? Array.from({ length: bucketCount }, (_, index) => {
    if (selection.bucket === 'hour') {
      const point = new Date(Date.now() - (bucketCount - index - 1) * 60 * 60 * 1000);
      point.setUTCMinutes(0, 0, 0);
      const key = `${point.toISOString().slice(0, 13)}:00Z`;
      const row = trafficByBucket.get(key);
      return { bucket: key, label: point.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false, timeZone: 'UTC' }), guestVisits: row?.guestVisits || 0, authenticatedVisits: row?.authenticatedVisits || 0, averageActiveSeconds: row?.averageActiveSeconds || 0 };
    }
    const point = new Date(Date.parse(selection.from) + index * 24 * 60 * 60 * 1000);
    const key = point.toISOString().slice(0, 10);
    const row = trafficByBucket.get(key);
    return { bucket: key, label: key.slice(5), guestVisits: row?.guestVisits || 0, authenticatedVisits: row?.authenticatedVisits || 0, averageActiveSeconds: row?.averageActiveSeconds || 0 };
  }) : [];

  const hourlyRows = db.prepare(`SELECT CAST(strftime('%H', started_at) AS INTEGER) AS hour, COUNT(*) AS visits
    FROM analytics_sessions WHERE started_at >= ? AND started_at < ? GROUP BY hour`).all(selection.from, selection.to);
  const hourlyByHour = new Map(hourlyRows.map((row) => [row.hour, row.visits]));
  const hourlyActivity = hourlyRows.length ? Array.from({ length: 24 }, (_, hour) => ({ hour, label: `${String(hour).padStart(2, '0')}:00`, visits: hourlyByHour.get(hour) || 0 })) : [];

  const topPages = db.prepare(`SELECT p.page_path AS pagePath, COUNT(*) AS pageViews
    FROM analytics_page_views p JOIN analytics_sessions s USING (session_id)
    WHERE p.occurred_at >= ? AND p.occurred_at < ?
    GROUP BY p.page_path ORDER BY pageViews DESC, p.page_path ASC LIMIT 8`).all(selection.from, selection.to);
  const visitorDistribution = db.prepare(`SELECT COUNT(DISTINCT CASE WHEN user_id IS NULL THEN visitor_id END) AS guests,
    COUNT(DISTINCT user_id) AS registeredUsers FROM analytics_sessions
    WHERE started_at >= ? AND started_at < ?`).get(selection.from, selection.to);

  return {
    range: selection.range,
    timeZone: 'UTC',
    traffic,
    hourlyActivity,
    topPages,
    visitorDistribution: { guests: visitorDistribution.guests || 0, registeredUsers: visitorDistribution.registeredUsers || 0 },
    engagementTrend: traffic.map(({ bucket, label, averageActiveSeconds }) => ({ bucket, label, averageActiveSeconds })),
  };
}

export function listGuestVisitors(query = {}) {
  const { page, pageSize, offset } = pageOptions(query);
  const filter = dateFilter(query);
  const search = String(query.search || '').trim().slice(0, 80);
  const searchNumber = Number.parseInt(search.replace(/^Guest\s*#?/i, ''), 10);
  const searchClause = search ? (Number.isFinite(searchNumber) ? 'AND v.visitor_number = ?' : 'AND (v.device_category LIKE ? OR v.browser_category LIKE ?)') : '';
  const searchParams = search ? (Number.isFinite(searchNumber) ? [searchNumber] : [`%${search}%`, `%${search}%`]) : [];
  const baseWhere = `WHERE EXISTS (SELECT 1 FROM analytics_sessions s WHERE s.visitor_id = v.visitor_id AND s.user_id IS NULL ${filter.sql}) ${searchClause}`;
  const total = db.prepare(`SELECT COUNT(*) AS count FROM analytics_visitors v ${baseWhere}`).get(...filter.params, ...searchParams).count;
  const rows = db.prepare(`SELECT v.visitor_number, MIN(s.started_at) AS first_visit_at, MAX(s.last_seen_at) AS last_seen_at,
    v.device_category, v.browser_category, v.referral_source, v.country_code,
    COUNT(s.session_id) AS visits, COALESCE(SUM(s.active_seconds), 0) AS total_active_seconds,
    ROUND(AVG(s.active_seconds), 0) AS average_visit_seconds,
    MAX(CASE WHEN s.ended_at IS NULL AND s.last_seen_at >= ? AND s.was_visible = 1 AND s.was_active = 1 THEN 1 ELSE 0 END) AS is_active,
    (SELECT page_path FROM analytics_page_views p JOIN analytics_sessions ps USING(session_id)
      WHERE ps.visitor_id = v.visitor_id AND ps.user_id IS NULL ORDER BY p.occurred_at DESC LIMIT 1) AS last_page
    FROM analytics_visitors v JOIN analytics_sessions s ON s.visitor_id = v.visitor_id AND s.user_id IS NULL
    ${filter.sql} ${searchClause}
    GROUP BY v.visitor_id ORDER BY v.last_seen_at DESC LIMIT ? OFFSET ?`)
    .all(new Date(Date.now() - ANALYTICS_ACTIVE_WINDOW_MS).toISOString(), ...filter.params, ...searchParams, pageSize, offset)
    .map((row) => ({ ...row, label: `Guest #${String(row.visitor_number).padStart(4, '0')}` }));
  return { items: rows, page, pageSize, total };
}

export function listRegisteredUsers(query = {}) {
  const { page, pageSize, offset } = pageOptions(query);
  const filter = dateFilter(query);
  const search = String(query.search || '').trim().slice(0, 100);
  const searchClause = search ? 'AND (u.full_name LIKE ? OR u.email LIKE ?)' : '';
  const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
  const total = search
    ? db.prepare(`SELECT COUNT(*) AS count FROM user_accounts u WHERE full_name LIKE ? OR email LIKE ?`).get(...searchParams).count
    : db.prepare('SELECT COUNT(*) AS count FROM user_accounts').get().count;
  const rows = db.prepare(`SELECT u.id, u.full_name AS name, u.email, u.photo_url AS photoUrl, u.auth_provider AS authProvider,
    u.registered_at AS registeredAt, u.last_login_at AS lastSignIn,
    COUNT(s.session_id) AS visits, COALESCE(SUM(s.active_seconds), 0) AS totalActiveSeconds,
    ROUND(AVG(s.active_seconds), 0) AS averageVisitSeconds,
    MAX(s.last_seen_at) AS lastActivity,
    MAX(CASE WHEN s.ended_at IS NULL AND s.last_seen_at >= ? AND s.was_visible = 1 AND s.was_active = 1 THEN 1 ELSE 0 END) AS isActive
    FROM user_accounts u LEFT JOIN analytics_sessions s ON s.user_id = u.id ${filter.sql}
    WHERE 1=1 ${searchClause} GROUP BY u.id ORDER BY COALESCE(MAX(s.last_seen_at), u.last_login_at, u.registered_at) DESC
    LIMIT ? OFFSET ?`)
    .all(new Date(Date.now() - ANALYTICS_ACTIVE_WINDOW_MS).toISOString(), ...filter.params, ...searchParams, pageSize, offset);
  return { items: rows, page, pageSize, total };
}

export function getRegisteredUserActivity(userId, query = {}) {
  if (typeof userId !== 'string' || !userId || userId.length > 200) return null;
  const account = db.prepare(`SELECT id, full_name AS name, email, photo_url AS photoUrl, auth_provider AS authProvider,
    registered_at AS registeredAt, last_login_at AS lastSignIn FROM user_accounts WHERE id = ?`).get(userId);
  if (!account) return null;
  const filter = dateFilter(query);
  const sessions = db.prepare(`SELECT session_id, started_at AS startedAt, last_seen_at AS lastSeenAt,
    ended_at AS endedAt, active_seconds AS activeSeconds,
    (ended_at IS NULL AND last_seen_at >= ? AND was_visible = 1 AND was_active = 1) AS isCurrent,
    (SELECT group_concat(page_path, ' | ') FROM (SELECT page_path FROM analytics_page_views p
      WHERE p.session_id = s.session_id ORDER BY occurred_at DESC LIMIT 20)) AS pageHistory
    FROM analytics_sessions s WHERE user_id = ? ${filter.sql} ORDER BY started_at DESC LIMIT 100`)
    .all(new Date(Date.now() - ANALYTICS_ACTIVE_WINDOW_MS).toISOString(), userId, ...filter.params);
  return { account, sessions };
}

export function getGuestVisitorActivity(visitorNumber) {
  const parsedNumber = Number.parseInt(visitorNumber, 10);
  if (!Number.isSafeInteger(parsedNumber) || parsedNumber < 1) return null;
  const visitor = db.prepare(`SELECT v.visitor_id, v.visitor_number, MIN(s.started_at) AS firstVisitAt, MAX(s.last_seen_at) AS lastSeenAt,
    v.device_category AS deviceCategory, v.browser_category AS browserCategory, v.referral_source AS referralSource, v.country_code AS countryCode
    FROM analytics_visitors v JOIN analytics_sessions s ON s.visitor_id = v.visitor_id AND s.user_id IS NULL
    WHERE v.visitor_number = ? GROUP BY v.visitor_id`).get(parsedNumber);
  if (!visitor) return null;
  const sessions = db.prepare(`SELECT s.session_id, s.started_at AS startedAt, s.last_seen_at AS lastSeenAt,
    s.ended_at AS endedAt, s.active_seconds AS activeSeconds,
    (s.ended_at IS NULL AND s.last_seen_at >= ? AND s.was_visible = 1 AND s.was_active = 1) AS isCurrent,
    (SELECT group_concat(page_path, ' | ') FROM (SELECT page_path FROM analytics_page_views p
      WHERE p.session_id = s.session_id ORDER BY occurred_at DESC LIMIT 20)) AS pageHistory
    FROM analytics_sessions s WHERE s.visitor_id = ? AND s.user_id IS NULL ORDER BY s.started_at DESC LIMIT 100`)
    .all(new Date(Date.now() - ANALYTICS_ACTIVE_WINDOW_MS).toISOString(), visitor.visitor_id);
  return { visitor: { ...visitor, label: `Guest #${String(visitor.visitor_number).padStart(4, '0')}` }, sessions };
}

export function getRecentAnalyticsActivity(query = {}) {
  const filter = dateFilter(query);
  const rows = db.prepare(`SELECT s.visitor_id, s.user_id, s.started_at AS startedAt, s.last_seen_at AS lastActivity,
    s.active_seconds AS activeSeconds, s.was_visible AS wasVisible, s.was_active AS wasActive, s.ended_at AS endedAt,
    v.visitor_number AS visitorNumber, u.full_name AS accountName,
    (SELECT page_path FROM analytics_page_views p WHERE p.session_id = s.session_id ORDER BY p.occurred_at DESC LIMIT 1) AS pagePath
    FROM analytics_sessions s
    LEFT JOIN analytics_visitors v ON v.visitor_id = s.visitor_id
    LEFT JOIN user_accounts u ON u.id = s.user_id
    WHERE 1=1 ${filter.sql} ORDER BY s.last_seen_at DESC LIMIT 12`).all(...filter.params);
  return rows.map((row) => ({
    type: row.user_id ? 'registered' : 'guest',
    displayName: row.user_id ? (row.accountName || 'Registered user') : `Guest #${String(row.visitorNumber || 0).padStart(4, '0')}`,
    startedAt: row.startedAt,
    lastActivity: row.lastActivity,
    activeSeconds: row.activeSeconds,
    pagePath: row.pagePath,
    isActive: !row.endedAt && Date.parse(row.lastActivity) >= Date.now() - ANALYTICS_ACTIVE_WINDOW_MS && row.wasVisible === 1 && row.wasActive === 1,
  }));
}
