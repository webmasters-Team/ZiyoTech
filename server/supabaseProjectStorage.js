import { parse as parseConnectionString } from 'pg-connection-string';
import { assertNonProductionDatabaseTarget, getSupabaseProjectReference } from './databaseTargetGuard.js';

const DEFAULT_BUCKET = 'ziyo-project-private';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']);

function storageConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    const error = new Error('Private project media storage is not configured on the backend.');
    error.code = 'SUPABASE_STORAGE_NOT_CONFIGURED';
    throw error;
  }
  const connection = process.env.DATABASE_URL ? parseConnectionString(process.env.DATABASE_URL) : null;
  const projectReference = getSupabaseProjectReference(process.env.DATABASE_URL);
  if (!projectReference) throw Object.assign(new Error('Private project storage refused an unverified Supabase project.'), { code: 'SUPABASE_PROJECT_IDENTITY_UNVERIFIED' });
  if (!(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.NODE_ENV === 'production')) {
    try { assertNonProductionDatabaseTarget(); } catch {
      throw Object.assign(new Error('Private project storage refused an unverified nonproduction project.'), { code: 'SUPABASE_PROJECT_IDENTITY_UNVERIFIED' });
    }
  }
  const baseUrl = process.env.SUPABASE_URL || `https://${projectReference}.supabase.co`;
  let parsedUrl;
  try { parsedUrl = new URL(baseUrl); } catch {
    throw new Error('SUPABASE_URL is invalid.');
  }
  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== `${projectReference}.supabase.co`) {
    const error = new Error('Supabase Storage URL does not match the configured backend database project.');
    error.code = 'SUPABASE_PROJECT_IDENTITY_UNVERIFIED';
    throw error;
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error('SUPABASE_STORAGE_BUCKET is invalid.');
  return { baseUrl: parsedUrl.origin, key, bucket };
}

function requestHeaders(config, extra = {}) {
  return { apikey: config.key, authorization: `Bearer ${config.key}`, ...extra };
}

async function ensurePrivateBucket(config) {
  const response = await fetch(`${config.baseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: requestHeaders(config, { 'content-type': 'application/json' }),
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: false,
      file_size_limit: MAX_UPLOAD_BYTES,
      allowed_mime_types: [...ALLOWED_TYPES],
    }),
  });
  if (response.ok) return;
  if (response.status === 400 || response.status === 409) {
    const existing = await fetch(`${config.baseUrl}/storage/v1/bucket/${encodeURIComponent(config.bucket)}`, { headers: requestHeaders(config) });
    const bucket = existing.ok ? await existing.json() : null;
    const allowedTypes = Array.isArray(bucket?.allowed_mime_types) ? bucket.allowed_mime_types : [];
    const hasSafeLimit = Number.isFinite(Number(bucket?.file_size_limit))
      && Number(bucket.file_size_limit) > 0
      && Number(bucket.file_size_limit) <= MAX_UPLOAD_BYTES;
    const hasSafeTypes = allowedTypes.length > 0 && allowedTypes.every((type) => ALLOWED_TYPES.has(type));
    if (bucket?.public === false && hasSafeLimit && hasSafeTypes) return;
  }
  const error = new Error('The private project media bucket could not be verified or created.');
  error.code = 'SUPABASE_STORAGE_BUCKET_UNAVAILABLE';
  throw error;
}

function objectUrl(config, storagePath) {
  const encodedPath = String(storagePath).split('/').map(encodeURIComponent).join('/');
  return `${config.baseUrl}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodedPath}`;
}

export async function storeProjectMedia(storagePath, bytes, mimeType, { replace = false } = {}) {
  if (!(bytes instanceof Buffer) || bytes.length < 1 || bytes.length > MAX_UPLOAD_BYTES) throw new Error('Project media size is invalid.');
  if (!ALLOWED_TYPES.has(mimeType)) throw new Error('Project media type is not supported.');
  const config = storageConfig();
  await ensurePrivateBucket(config);
  const response = await fetch(objectUrl(config, storagePath), {
    method: 'POST',
    headers: requestHeaders(config, { 'content-type': mimeType, 'x-upsert': replace ? 'true' : 'false' }),
    body: bytes,
  });
  if (!response.ok) {
    const error = new Error('Project media could not be saved to private Supabase Storage.');
    error.code = 'SUPABASE_STORAGE_WRITE_FAILED';
    throw error;
  }
  return { storagePath, sizeBytes: bytes.length };
}

export async function readProjectMedia(storagePath) {
  const config = storageConfig();
  const response = await fetch(objectUrl(config, storagePath), { headers: requestHeaders(config) });
  if (!response.ok) {
    const error = new Error('Project media could not be loaded from private Supabase Storage.');
    error.code = 'SUPABASE_STORAGE_READ_FAILED';
    throw error;
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function deleteProjectMedia(storagePath) {
  const config = storageConfig();
  const response = await fetch(`${config.baseUrl}/storage/v1/object/${encodeURIComponent(config.bucket)}`, {
    method: 'DELETE',
    headers: requestHeaders(config, { 'content-type': 'application/json' }),
    body: JSON.stringify({ prefixes: [storagePath] }),
  });
  if (!response.ok && response.status !== 404) {
    const error = new Error('Project media could not be removed from private Supabase Storage.');
    error.code = 'SUPABASE_STORAGE_DELETE_FAILED';
    throw error;
  }
}

export function isAllowedProjectMediaType(mimeType) { return ALLOWED_TYPES.has(mimeType); }
