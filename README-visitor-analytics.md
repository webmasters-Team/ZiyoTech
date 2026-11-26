# ZiyoTech Visitor Analytics

## Data model and privacy

Tracking starts only after a visitor selects **Allow analytics**. A persistent first-party random browser ID and a separate session ID are stored in HttpOnly cookies. Declining or turning analytics off sends a session-close request, clears both analytics cookies, and stops collection. The consent choice is stored locally so it can be changed through **Privacy choices**.

The tracker stores page paths without query strings or fragments, device/browser categories, a referring host, timestamps, and estimated active seconds. It does not store raw IP addresses, raw user-agent strings, authentication tokens, session cookies, personal chatbot messages, form input, or precise location. Country remains unavailable unless a reliable country-only source is configured in the future.

Detailed analytics events are removed after 90 days. Raw visitor IDs are random and first-party; they are never used as account IDs. A guest who signs in has only the current analytics session associated with their verified account session. Earlier anonymous sessions stay anonymous. A subsequent signed-out session starts as a guest again. The account ID comes from the verified HttpOnly account session cookie, never from a client request body.

## Timing definitions

- Heartbeats are sent every 30 seconds and when the page visibility changes.
- The browser considers a session recently active for five minutes after pointer, keyboard, touch, or scroll input.
- A session is closed after 30 minutes without recent activity. A server-side minute timer closes idle sessions even when no browser end event arrives (for example, after a browser closes); the next event also checks the timeout.
- The backend accumulates time only between qualifying visible/active heartbeats, with a maximum of 45 seconds credited per interval. Longer gaps are not counted.
- A visitor is shown as active only when the latest heartbeat reports a visible and recently active page, within the last 90 seconds.
- Durations are measured estimates of visible, recently active page time. They do not prove attention or exact time spent.

Page-view events have an idempotency key. Repeated submissions with the same key are ignored. A page path is sent once per in-app navigation in the browser tab.

## Dashboard definitions

- **Guest visitors**: distinct random browser IDs with anonymous sessions during the selected period; this does not identify people.
- **Registered accounts**: all rows in `user_accounts`, whether they visited or not.
- **Guest visits**: sessions without a verified account association.
- **Authenticated visits**: sessions attached to a verified account.
- **Active guests/users**: distinct anonymous browser IDs or accounts with an active session under the 90-second rule.
- Average durations are the mean of measured active seconds per session for the selected category and date range.
- Guest and registered activity appear in separate lists. Anonymous sessions from before sign-in remain in the guest history; only the session active at sign-in is assigned to the verified account.

## Endpoints

Public aggregate endpoint (no cookies or request identifiers):

- `POST /api/visitor-analytics/aggregate-visit`

Public, opt-in detailed tracking endpoints:

- `POST /api/visitor-analytics/session`
- `POST /api/visitor-analytics/page-view`
- `POST /api/visitor-analytics/heartbeat`
- `POST /api/visitor-analytics/end`

Administrator endpoints:

- `GET /api/visitor-analytics/overview`
- `GET /api/visitor-analytics/charts`
- `GET /api/visitor-analytics/guests` and `/guests/:visitorNumber`
- `GET /api/visitor-analytics/users` and `/users/:userId`
- `GET /api/visitor-analytics/recent`

Administrator analytics endpoints require either an active verified Firebase account session whose PostgreSQL `user_accounts.role` is `admin`, or a database-backed Admin ID session created for an existing active admin. APIs do not accept a client-side auth flag, a browser-stored bearer token, or a client-supplied account ID. Administrator roles must be explicitly provisioned by a trusted database operator; there is no self-service role assignment.

## Local verification and setup

1. Configure `VITE_ASSISTANT_API_BASE_URL` for the backend origin (development defaults to `http://localhost:4000`).
2. Sign in through the existing account flow so a verified account row exists.
3. A trusted operator may assign dashboard access only after verifying the account owner, for example with `UPDATE user_accounts SET role = 'admin' WHERE id = '<verified Firebase UID>';`. Do not expose a role-update operation to normal users. Sign in to that account in the site before opening **Admin Dashboard** in the existing platform navigation so the existing HttpOnly account session is present.
4. Configure `AUTH_ALLOWED_ORIGINS`/`APP_URL` for deployed origins, then restart the backend under the existing operational procedure.
5. On the website, opt in to analytics, navigate between pages, change tabs, and wait for heartbeats. Open **Admin Dashboard** using the provisioned account session; its view is titled **Visitor Analytics**.

### Secure Admin ID and password

For an existing active admin role, run this local interactive setup once:

```powershell
npm run setup:admin-credentials -- --username <admin-id>
```

The command uses the single existing active admin account; if multiple admins exist, select the intended existing account with `--account-id <uid>`. It never creates or promotes an account. Password entry is hidden, requires at least 14 characters, and stores only a per-password salt and scrypt hash in PostgreSQL. If a credential already exists, replacement requires typing `REPLACE`; that also revokes current Admin ID sessions. Run the command in an interactive terminal. Never put the password in `.env`, source code, or chat.

The web login accepts the configured Admin ID and password. The backend rate-limits failed login attempts and stores a hash of each random session token in PostgreSQL. The raw session stays in an HttpOnly, SameSite cookie (Secure in production), expires after eight hours, and is revoked on sign-out or credential replacement. Mutating administrator APIs require a CSRF token and check the active PostgreSQL admin role on every request. Ordinary Firebase sign-in and its separate user session remain available.

The analytics overview and charts use UTC time buckets. The range control supports the last 24 hours, 7 UTC calendar days, 30 UTC calendar days, or a custom UTC calendar-date range up to 366 days. Unique tracked visitors are distinct anonymous browser IDs plus distinct registered account IDs with a visit; guests and authenticated visitors remain separate series. The charts use PostgreSQL session, page-view, and measured active-time records. Empty ranges render empty states, never sample values.

No geolocation provider or additional package is required. Country will remain blank unless a trusted, country-only edge header is later integrated and validated.

The dashboard refreshes its overview, directories, recent activity, and an open detail panel every five seconds while visible. Polling pauses when the tab is hidden and resumes when it becomes visible. Dashboard polling does not create tracking events. Detailed visitor analytics (visitor IDs, sessions, and page views) start only after **Allow analytics**. Declining or leaving the choice unanswered prevents detailed tracking; the separate anonymous aggregate counter is described below.

## Automatic Guest Visits (separate aggregate metric)

The **Automatic Guest Visits** counter is independent of the consent-based visitor records above. On a public top-level document navigation (`PerformanceNavigationTiming.type === "navigate"`), the app sends one empty `POST /api/visitor-analytics/aggregate-visit`. It does not require registration or an analytics choice. The server increments a UTC-hour aggregate counter only. The request omits cookies and the database stores no visitor/session ID, IP address, user agent, referrer, page path, or per-request timestamp. The aggregate rows are retained for 400 days and then removed.

This is an approximate count of eligible document opens, not unique people, browsers, or visits in the session sense. Reload and back/forward navigation types are excluded; SPA route changes, background requests, detailed-tracking heartbeats, and dashboard polling do not call the counter. Separate tabs, profiles, devices, and repeated top-level opens can each count. This design deliberately cannot deduplicate across them or reliably filter bots and prerendering. A failed request can undercount; the client sends once per document to avoid duplicate increments without introducing an idempotency identifier. Historical consent-based data is not migrated, reclassified, or added to this counter.

The implementation is designed to keep the persisted counter anonymous. The app code does not read or store the request IP, but the network host or reverse proxy necessarily receives transport metadata and may have separate access logs. Verify those logs and the hosting jurisdiction before production use. Uzbekistan's Personal Data Law defines personal data by reference to an individual or identifiability (Article 4), requires anonymization for statistical processing (Article 18), and defines anonymization by whether attribution to a subject becomes impossible (Article 16). This technical assessment is not a legal opinion; assess applicable laws and infrastructure logs for each production deployment.
