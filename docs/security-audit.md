# Security Audit Notes

Last reviewed: 2026-04-30

BookStore is a portfolio-oriented commerce project, but the public deployment is treated like a production surface: secrets stay outside Git, public responses are sanitized, dependency audits are run, and health checks avoid leaking operational detail.

## Current Security Posture

- Frontend dependency audit reports 0 known vulnerabilities at the moderate threshold and above.
- Public catalog, promotions, flash sale, health, and chatbot paths are covered by Playwright smoke/audit tests.
- Public health responses avoid raw provider exception text and private user data.
- Render secrets are generated or configured through environment variables, not committed source defaults.
- Same-origin `/api` proxy is used by the frontend to keep browser traffic consistent and reduce CORS exposure.

## Hardened Areas

### Secrets and configuration

- Removed production-like secret defaults from public configuration.
- Required `JWT_SECRET` explicitly in production/render profiles.
- Required production `DB_PASSWORD` and `APP_BASE_URL` so the prod profile cannot silently fall back to local demo values.
- Moved portfolio demo account passwords out of source defaults; Render generates demo passwords through environment values.
- Kept `.env`, provider keys, database credentials, mail credentials, VNPay keys, Grok keys, and deploy hooks out of Git.

### Authentication and authorization

- Frontend auth state restores from cookies and `/users/me` instead of persisting the authenticated user object in `localStorage`.
- Browser-managed auth cookies include `SameSite=Lax`, `path=/`, and HTTPS-only `Secure` behavior when appropriate.
- Email test endpoints are restricted to admin-authenticated users when the test controller is enabled.
- Chatbot statistics require admin authorization.

### Headers, CORS, and browser safety

- Added frontend security headers for CSP, frame blocking, HSTS, and browser permissions policy.
- Aligned backend CSP and Permissions-Policy values across Spring Security and the global security header filter.
- Removed broad wildcard default CORS origins from backend security defaults.
- Hardened Next.js SVG image handling with `contentDispositionType: "attachment"` and an image CSP that blocks scripts in served SVGs.
- Replaced broad remote image patterns with explicit allowed hosts.

### Input validation and uploads

- Tightened request-body validation so chunked over-limit payloads are rejected instead of truncated silently.
- Skipped multipart body scanning in the input validation filter; upload validation is handled by `StorageService`.
- Hardened upload storage path resolution and delete handling so files must remain under the configured upload root.

### Chatbot and provider safety

- Kept `GROK_ENABLED=false` by default.
- Shortened shared `RestTemplate` timeouts to reduce provider-related storefront stalls.
- Recorded Grok fallback responses separately from provider-backed responses.
- Sanitized public chatbot health messages so provider failures do not expose raw exception text or provider URLs.
- Removed user email from the context sent to the chatbot provider; the prompt uses display name and order count only.

### Frontend resilience

- Added same-origin API proxy fallback behavior for public storefront endpoints.
- Added portfolio-safe fallback payloads for public catalog proxy endpoints so Render cold starts do not surface avoidable `429` or timeout responses on public pages.
- Added frontend error reporting endpoint and client error reporter for lightweight operational visibility.
- Added generated PNG/ICO app icons so browser/PWA metadata does not depend only on the legacy SVG icon.

### Dependency posture

- Upgraded frontend runtime/tooling to Next.js 16, React 19, ESLint 9, and Vitest 4.
- Added a frontend `postcss` override to keep Next's internal PostCSS dependency on the patched line.
- Upgraded the mobile workspace to Expo SDK 55, React Native 0.83, and React 19.2.
- Added mobile dependency overrides for `postcss` and `uuid`.
- Removed unused legacy mobile dependencies after confirming there are no app imports.

## Validation Evidence

Most recent local production audit:

- `npm run lint`: pass
- `npm run test:run`: 150 tests passing
- `npm run build`: pass
- `npm audit --audit-level=moderate`: 0 vulnerabilities
- `npm run test:e2e:portfolio-audit`: 49 tests passing
- `npm run test:e2e:journey`: 5 passing, 1 intentional mobile-only skip
- `npm run test:e2e:admin-portfolio`: 6 tests passing
- `npm run monitor:health`: frontend, backend, and database `UP`
- `mvn -q -DskipTests compile`: pass

## Remaining Recommendations

- Move browser auth tokens to HttpOnly cookies with CSRF protection in a future auth-flow change.
- Tighten frontend CSP further by removing `unsafe-inline` and `unsafe-eval` once the app has nonce/hash support for Next runtime scripts.
- Keep `management.endpoint.health.show-details=when-authorized` or stricter in public environments.
- Keep chatbot provider integration disabled unless `GROK_API_KEY` is present and provider latency is acceptable.
- Run a real Android/iOS EAS build before treating the mobile workspace as store-release ready.
- Rotate deploy hooks immediately if they are copied into screenshots, logs, tickets, or chat.

## What Not To Commit

- `.env` files with real credentials
- Render deploy hook URLs
- JWT secrets
- Mail provider credentials
- VNPay credentials
- Grok or other AI provider API keys
- Production database URLs or passwords
- Exported user data, order data, or logs containing customer information
