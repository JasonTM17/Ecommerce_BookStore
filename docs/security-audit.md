# Security audit notes

Last reviewed: 2026-04-26

This project is a portfolio/demo bookstore, but the public deployment should still avoid avoidable leaks and fragile defaults.

## Fixed in this hardening pass

- Corrected mojibake in backend demo seed names so API/demo data no longer emits broken Vietnamese text.
- Hardened Next.js SVG image handling with `contentDispositionType: "attachment"` and an image CSP that blocks scripts in served SVGs.
- Replaced broad remote image patterns with exact local/dev upload hosts and the deployed backend upload host.
- Stopped persisting the authenticated user object in `localStorage`; auth state now restores from cookies and `/users/me`.
- Added `SameSite=Lax`, `path=/`, and HTTPS-only `Secure` cookie behavior for browser-managed auth cookies.
- Added frontend security headers for CSP, frame blocking, HSTS, and browser permissions policy.
- Aligned backend CSP and Permissions-Policy values across Spring Security and the global security header filter, including CORS preflight responses.
- Replaced emoji-based backend log prefixes with ASCII text so Windows/CI logs do not render security events as broken glyphs.
- Moved portfolio demo account passwords out of source defaults; Render now generates demo passwords and the app no longer logs them.
- Disabled demo seeding by default outside explicit dev/local/render/e2e settings.
- Restricted email test endpoints to admin-authenticated users even when the test controller is enabled.
- Reduced public actuator health detail exposure in production/render profiles while preserving liveness/readiness health checks.
- Removed broad wildcard default CORS origins from backend security defaults.
- Required `JWT_SECRET` explicitly in production/render profiles.
- Required production `DB_PASSWORD` and `APP_BASE_URL` explicitly so the prod profile no longer falls back to local demo values.
- Tightened request-body validation so chunked over-limit payloads are rejected instead of truncated silently.
- Skipped multipart body scanning in the input validation filter; upload validation is handled by `StorageService`.
- Hardened upload storage path resolution and delete handling so files must remain under the configured upload root.
- Reduced outbound chatbot fragility by shortening shared `RestTemplate` timeouts and recording Grok fallback responses separately from provider-backed responses.
- Updated `follow-redirects` in frontend and mobile lockfiles to `1.16.0`.
- Upgraded the frontend runtime/tooling from Next.js 14/React 18/ESLint 8/Vitest 2 to Next.js 16/React 19/ESLint 9/Vitest 4 and migrated the removed `next lint`/middleware conventions.
- Added a frontend `postcss` override to keep Next's internal PostCSS dependency on the patched `8.5.10` line.
- Upgraded the mobile app from Expo SDK 50/React Native 0.73/React 18 to Expo SDK 55/React Native 0.83/React 19.2 and installed the Reanimated 4 `react-native-worklets` peer dependency.
- Added mobile dependency overrides for `postcss` and `uuid` so Expo's config/prebuild tooling resolves to patched versions without downgrading Expo.
- Removed the unused legacy `expo-barcode-scanner` dependency after confirming there are no app imports.

## Dependency audit status

### Frontend

Current status: `npm audit --omit=dev` and full `npm audit` report 0 known vulnerabilities after the Next.js 16 upgrade and PostCSS override.

Validation run: `npm run lint`, `npm run test:run`, and `npm run build` pass locally.

### Mobile

Current status: `npm audit --omit=dev` and full `npm audit` report 0 known vulnerabilities after the Expo SDK 55 upgrade and dependency overrides.

Validation run: `npm run typecheck` and `npx expo-doctor` pass locally. A real Android/iOS EAS build should still be run before treating the mobile upgrade as store-release ready.

## Operational recommendations

- Keep `JWT_SECRET`, database credentials, mail credentials, VNPay keys, and Grok API keys only in deployment secrets.
- Keep `management.endpoint.health.show-details=when-authorized` or stricter in public environments.
- Move browser auth tokens to HttpOnly cookies in a future auth-flow change with CSRF protection; this was not done here because it changes API/browser contracts.
- Tighten frontend CSP further in a framework upgrade pass by removing `unsafe-inline`/`unsafe-eval` once the app has nonce/hash support for Next runtime scripts.
- Keep the chatbot in `GROK_ENABLED=false` mode unless `GROK_API_KEY` is present and provider latency is acceptable for the storefront.
