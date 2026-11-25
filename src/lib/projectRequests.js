/** @typedef {import('../types').ProjectRequest} ProjectRequest */
const DATE_FIELDS = ['createdAt', 'created_at', 'submittedAt', 'submitted_at', 'timestamp', 'created', 'date'];

/** @param {unknown} value @returns {string} */
export function normalizeRequestDate(value) {
  if (value == null || value === '') return '';
  let date = value;
  if (typeof value?.toDate === 'function') {
    try { date = value.toDate(); } catch { return ''; }
  } else if (typeof value === 'object' && 'seconds' in value) {
    date = new Date(Number(value.seconds) * 1000);
  }
  const parsed = date instanceof Date ? date : new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

/** @param {Record<string, any>} item @param {string} [fallbackId] @returns {ProjectRequest | null} */
export function normalizeProjectRequest(item = {}, fallbackId = '') {
  const id = String(item.id || item.reqId || fallbackId || '');
  if (!id) return null;
  const dateValue = DATE_FIELDS.map((field) => item[field]).find((value) => value != null && value !== '');
  /** @type {ProjectRequest['preferredLang']} */
  const preferredLang = ['uz', 'ru', 'en'].includes(item.preferredLang) ? item.preferredLang : 'uz';
  /** @type {ProjectRequest['status']} */
  const status = ['new', 'review', 'contacted', 'completed'].includes(item.status) ? item.status : 'new';
  return {
    id,
    name: String(item.name || ''),
    businessName: String(item.businessName || ''),
    email: String(item.email || ''),
    phoneOrTelegram: String(item.phoneOrTelegram || ''),
    serviceId: String(item.serviceId || 'ai-automation'),
    projectDesc: String(item.projectDesc || ''),
    preferredLang,
    status,
    source: 'website',
    createdAt: normalizeRequestDate(dateValue),
  };
}

/** @param {Array<Record<string, any>>} items @returns {ProjectRequest[]} */
export function normalizeProjectRequests(items = []) {
  return items.map((item) => normalizeProjectRequest(item, item?.id)).filter((item) => item !== null);
}

/** @param {ProjectRequest[]} localItems @param {ProjectRequest[]} remoteItems @returns {ProjectRequest[]} */
export function mergeProjectRequests(localItems = [], remoteItems = []) {
  const merged = new Map();
  for (const item of localItems) {
    const normalized = normalizeProjectRequest(item, item?.id);
    if (normalized) merged.set(normalized.id, normalized);
  }
  for (const item of remoteItems) {
    const normalized = normalizeProjectRequest(item, item?.id);
    if (normalized) merged.set(normalized.id, normalized);
  }
  return sortProjectRequests([...merged.values()]);
}

/** @param {ProjectRequest[]} items @returns {ProjectRequest[]} */
export function sortProjectRequests(items = []) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NEGATIVE_INFINITY;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NEGATIVE_INFINITY;
    return (Number.isNaN(bTime) ? Number.NEGATIVE_INFINITY : bTime) - (Number.isNaN(aTime) ? Number.NEGATIVE_INFINITY : aTime);
  });
}

/** @param {string | null} raw @returns {{valid: boolean, requests: ProjectRequest[]}} */
export function parseProjectRequestStorage(raw) {
  if (raw == null) return { valid: true, requests: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { valid: false, requests: [] };
    return { valid: true, requests: normalizeProjectRequests(parsed) };
  } catch {
    return { valid: false, requests: [] };
  }
}
