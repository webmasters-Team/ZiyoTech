# Cloudflare Pages preview readiness

## Pages project settings

- Framework preset: React (Vite)
- Root directory: repository root
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22.23.4` (pinned in `.node-version`; Vite 8 requires Node 20.19+ or 22.12+)
- Production custom domain and DNS: leave unchanged for a preview deployment
- Keep `VITE_PROJECT_MANAGEMENT_ENABLED=false` and backend `PROJECT_MANAGEMENT_ENABLED=false` until the PostgreSQL PM migration is separately validated and approved.

## Build blocker

The current local build emits `assets/video_for_main-DdMFBX4f.mp4` at 29,435,955 bytes, above Cloudflare Pages' 25 MiB per-file asset limit. Before deploying, preserve the video by either optimizing it below the limit or serving it from an approved external asset origin. Do not omit it from the frontend.

## Preview build variables

Configure these in the Cloudflare Pages **Preview** environment only. Values prefixed `VITE_` are public and are embedded in client assets; never set server secrets here.

```text
VITE_API_URL=https://api.ziyotech.net
VITE_ASSISTANT_API_BASE_URL=https://api.ziyotech.net
VITE_PROJECT_MANAGEMENT_ENABLED=false
VITE_FIREBASE_API_KEY=<Firebase Web app API key>
VITE_FIREBASE_AUTH_DOMAIN=<Firebase Web app auth domain>
VITE_FIREBASE_PROJECT_ID=ziyotech-platform
VITE_FIREBASE_STORAGE_BUCKET=<Firebase Web app storage bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<Firebase Web app messaging sender ID>
VITE_FIREBASE_APP_ID=<Firebase Web app app ID>
VITE_FIREBASE_MEASUREMENT_ID=<optional Firebase measurement ID>
```

The Firebase project ID above comes from this repository's `.firebaserc` default alias. Confirm in Firebase Console that this is the intended project before configuring a preview. The other Web App values are not present in this checkout. Copy them together from the intended Firebase Console Web App; do not use an Admin SDK service-account file. The frontend requires the API key, auth domain, project ID, and app ID; the other Web App fields should also match the same app when configured.

## Authentication arrangement for a protected preview

Prefer a stable Pages custom hostname such as `https://preview.ziyotech.net`, attached to a non-production Pages branch after that branch has a successful preview deployment. Cloudflare supports custom domains pointing at branch aliases when the CNAME is proxied. Protect the generated preview aliases with Pages preview access controls and put a separate Cloudflare Access application/policy on the custom preview hostname; do not assume Pages preview access controls automatically protect the custom hostname. Do not use a broad `*.pages.dev` CORS allowlist. The current production API accepts exact origins from `APP_URL` and `AUTH_ALLOWED_ORIGINS`, has credentialed CORS, and issues `Secure`, `HttpOnly`, `SameSite=Lax`, host-only session cookies in production. A sibling HTTPS hostname under `ziyotech.net` is same-site with `api.ziyotech.net`, so these cookie attributes can be retained. The API must still allow the exact preview origin in `AUTH_ALLOWED_ORIGINS`; leave `APP_URL=https://ziyotech.net` as the production canonical URL. Existing CSRF-token checks must remain enabled. Verify login, session refresh, logout, and analytics access from the protected preview before treating it as fully functional.

If Firebase Authentication flows are used in the preview, add the exact preview hostname to that Firebase project's Authorized domains. This requires approval in Firebase Console. Creating the branch custom domain, adding the proxied DNS alias, configuring Access, or adding the preview origin to Render also requires separate approval. Keep Pages Preview build variables in its Preview environment and never copy them into Production by accident. The current deployment files do not confirm the production service's environment values.

## Firebase Project Requests data-safety blocker

The application reads `projectRequests` with Firestore `onSnapshot`, creates requests with `setDoc`, and changes statuses with `updateDoc`. The checked-in `firestore.rules` permits unauthenticated read and write. Therefore, configuring the preview with the current Firebase project would expose and allow modification of live request records to any client, not only users who can reach the Pages preview. Cloudflare Access on the preview hostname does not restrict direct Firestore API access.

Do not point a preview at live Project Requests until a separately approved data-isolation change is completed. Safe choices are an isolated Firebase preview project with non-production data, or moving privileged request reads/status changes behind an authenticated backend and tightening Firestore rules. The current administrator's PostgreSQL-backed cookie session is not visible to Firestore Security Rules, so rules cannot securely distinguish this admin from anonymous clients without an auth integration or backend proxy.

## Local validation

This checkout builds as a Vite SPA; it has no top-level `404.html`. Cloudflare Pages' default SPA handling serves the root app for `/admin`. The generated bundle must be built with the Preview API URL and Firebase Web App settings; no database URL, Supabase key, Gemini key, administrator credential, private key, or server access-code pepper belongs in those settings.
