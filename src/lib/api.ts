/** Shared backend origin for all browser API requests. */
const configuredApiBase =
  import.meta.env.VITE_ASSISTANT_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : '');

export const API_BASE_URL = configuredApiBase.replace(/\/+$/, '');
