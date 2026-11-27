import { resolveApiBase } from './apiBase';

/** Shared backend origin for all browser API requests. */
const configuredApiBase =
  import.meta.env.VITE_ASSISTANT_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:4001' : 'https://api.ziyotech.net');

export const API_BASE_URL = resolveApiBase(
  configuredApiBase,
  import.meta.env.DEV,
  typeof window === 'undefined' ? undefined : window.location.hostname,
);
