const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);

export function resolveApiBase(configuredBase, isDevelopment, pageHostname) {
  const fallback = String(configuredBase || '').replace(/\/+$/, '');
  if (!isDevelopment || !pageHostname) return fallback;

  try {
    const apiUrl = new URL(configuredBase);
    if (loopbackHosts.has(apiUrl.hostname) && loopbackHosts.has(pageHostname)) {
      // localhost and 127.0.0.1 are different sites for SameSite=Lax cookies.
      apiUrl.hostname = pageHostname;
    }
    return apiUrl.toString().replace(/\/+$/, '');
  } catch {
    return fallback;
  }
}
