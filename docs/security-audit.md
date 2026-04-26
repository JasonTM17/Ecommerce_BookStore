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
- Tightened request-body validation so chunked over-limit payloads are rejected instead of truncated silently.
- Skipped multipart body scanning in the input validation filter; upload validation is handled by `StorageService`.
- Hardened upload storage path resolution and delete handling so files must remain under the configured upload root.
- Reduced outbound chatbot fragility by shortening shared `RestTemplate` timeouts and recording Grok fallback responses separately from provider-backed responses.
- Updated `follow-redirects` in frontend and mobile lockfiles to `1.16.0`.

## Residual dependency advisories

### Frontend

`npm audit --omit=dev` still reports advisories tied to the current Next.js 14 line, including image optimizer and RSC/rewrites DoS advisories. The available npm fix proposes a major upgrade to Next.js 16, which is intentionally out of scope for this safe hardening pass.

Recommended follow-up: create a dedicated Next.js upgrade branch, move from Next 14 to the current supported major, and rerun the full frontend unit, production build, Playwright portfolio smoke, and deployment checks.

### Mobile

`npm audit --omit=dev` still reports transitive Expo/React Native advisories around XML serialization/parsing, tar extraction, semver ReDoS, PostCSS, and related CLI tooling. The available npm fixes propose major Expo/React Native changes and may require app config/native compatibility work.

Recommended follow-up: create a dedicated Expo SDK upgrade branch, upgrade Expo/React Native together, and validate Android/iOS/web startup plus `npm run typecheck`.

## Operational recommendations

- Keep `JWT_SECRET`, database credentials, mail credentials, VNPay keys, and Grok API keys only in deployment secrets.
- Keep `management.endpoint.health.show-details=when-authorized` or stricter in public environments.
- Move browser auth tokens to HttpOnly cookies in a future auth-flow change with CSRF protection; this was not done here because it changes API/browser contracts.
- Tighten frontend CSP further in a framework upgrade pass by removing `unsafe-inline`/`unsafe-eval` once the app has nonce/hash support for Next runtime scripts.
- Keep the chatbot in `GROK_ENABLED=false` mode unless `GROK_API_KEY` is present and provider latency is acceptable for the storefront.
