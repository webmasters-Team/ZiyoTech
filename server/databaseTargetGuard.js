import { parse as parseConnectionString } from 'pg-connection-string';

// These Supabase projects have been identified as production and must never be
// targets for local tooling, even if a caller sets an opt-in variable.
const protectedProductionProjectRefs = new Set([
  'zcfdillzytjsqgrrevhw',
  'nydujrqrlzblvwjblzwc',
]);

export function getSupabaseProjectReference(databaseUrl) {
  if (typeof databaseUrl !== 'string' || !databaseUrl) return null;
  let parsed;
  try { parsed = parseConnectionString(databaseUrl); } catch { return null; }
  const fromUsername = (parsed.user || '').match(/^postgres\.([a-z0-9]+)$/i)?.[1];
  const fromHostname = (parsed.host || '').match(/^([a-z0-9]+)\.supabase\.(?:co|com)$/i)?.[1];
  return (fromUsername || fromHostname || '').toLowerCase() || null;
}

export function isProtectedProductionProject(projectReference) {
  return protectedProductionProjectRefs.has(String(projectReference || '').toLowerCase());
}

export function assertNonProductionDatabaseTarget({
  databaseUrl = process.env.DATABASE_URL,
  allowedProjectRef = process.env.ZIYOTECH_NONPRODUCTION_PROJECT_REF,
  allowDatabaseAccess = process.env.ZIYOTECH_ALLOW_NONPRODUCTION_DATABASE,
  productionRuntime = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.NODE_ENV === 'production'),
} = {}) {
  if (productionRuntime) throw new Error('Local database tooling is disabled in a production runtime.');
  if (allowDatabaseAccess !== 'true') {
    throw new Error('Database access is disabled. Explicitly opt in to a verified nonproduction project first.');
  }
  const actualProjectRef = getSupabaseProjectReference(databaseUrl);
  if (!actualProjectRef || !allowedProjectRef || actualProjectRef !== allowedProjectRef.toLowerCase()) {
    throw new Error('Database project identity is missing or does not match the explicit nonproduction target.');
  }
  if (isProtectedProductionProject(actualProjectRef)) {
    throw new Error('Database access refused: this Supabase project is protected as production.');
  }
  return actualProjectRef;
}
