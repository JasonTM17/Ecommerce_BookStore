# Changelog

All notable portfolio, product, deployment, and documentation changes are recorded here.

## Unreleased

- Reworked project documentation into a production-style portfolio case study.
- Added production runbooks, portfolio asset documentation, and clearer Render deployment troubleshooting.
- Aligned documentation with current Render health paths and manual deploy strategy.
- Replaced generic design inspiration notes with BookStore-specific design system guidance.

## 1.1.2 - 2026-04-29

- Stabilized backend demo runtime and catalog seed data for local production verification.
- Polished storefront UX across header, flash sale, cart, checkout, product cards, and chatbot surfaces.
- Added frontend error logging, client error reporter, health monitor script, and route-level SEO metadata.
- Added Open Graph image assets and screenshot capture workflow for portfolio presentation.
- Added Playwright coverage for public UI/SEO audit, storefront journey, chatbot behavior, mobile flows, and admin smoke routes.
- Fixed duplicated SEO title branding on route metadata.
- Verified local production build with lint, unit tests, E2E audits, dependency audit, health monitor, and backend compile.

## 1.0.1 - 2026-04-27

- Added generated BookStore app icons for favicon, Apple touch icon, and PWA metadata.
- Routed frontend API calls through the same-origin Next.js `/api` proxy by default.
- Added a public backend fallback for standalone local and Docker Hub frontend runs.
- Documented the API proxy and icon hardening in the security audit notes.
