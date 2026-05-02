# BookStore Commerce Platform

BookStore is a production-style full-stack e-commerce portfolio project for selling books online. It combines a Spring Boot API, a Next.js storefront, a PostgreSQL/MySQL data layer, an admin surface, flash-sale automation, chatbot support, monitoring, and automated quality gates.

The project is built to demonstrate real product engineering: clear commerce flows, resilient local production checks, documented Render deployment, and repeatable test evidence.

## Portfolio Preview

These preview images are lightweight assets tracked in the repository. Full-size generated screenshots are kept out of Git and can be regenerated locally.

![BookStore home](./docs/portfolio/previews/home.webp)
![BookStore flash sale](./docs/portfolio/previews/flash-sale.webp)
![BookStore chatbot](./docs/portfolio/previews/chatbot-mobile.webp)

Refresh the full screenshot set after UI changes:

```bash
cd frontend
BASE_URL=http://localhost:3001 npm run portfolio:screenshots
```

PowerShell:

```powershell
cd frontend
$env:BASE_URL = "http://localhost:3001"
npm run portfolio:screenshots
```

## Product Scope

- Public storefront with categories, product detail pages, promotions, wishlist, cart, checkout, and order history.
- Timed flash-sale experience with active and upcoming sale windows.
- Same-origin API proxy so local, Docker, and Render paths behave consistently.
- Chatbot widget with provider health handling and safe public fallback behavior.
- Admin dashboard for products, orders, users, and operational review.
- SEO metadata, Open Graph image, sitemap, robots, JSON-LD, and web-vitals hooks.
- Health monitoring for frontend, backend, and database readiness.

## Technology Stack

| Area | Stack |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, React Query, Zustand |
| Backend | Spring Boot 3.5, Java 17, Spring Security, JWT, Spring Data JPA, Actuator |
| Data | MySQL for local and CI, PostgreSQL for Render |
| Testing | Vitest, Playwright, Maven, npm audit |
| DevOps | Docker Compose, Render Blueprint, GitHub Actions, Docker Hub publish |
| Mobile | Expo workspace maintained for future app release work |

## Verified Quality Gates

Last full production recovery audit: **May 2, 2026**.

| Gate | Command | Current result |
| --- | --- | --- |
| Frontend build | `cd frontend && npm run build` | Pass |
| Frontend lint | `cd frontend && npm run lint` | Pass |
| Frontend unit tests | `cd frontend && npm run test:run` | 150 tests passing |
| Public UI/SEO audit | `cd frontend && BASE_URL=http://localhost:3001 npm run test:e2e:portfolio-audit` | 49 tests passing |
| Storefront journey | `cd frontend && BASE_URL=http://localhost:3001 npm run test:e2e:journey` | 5 passing, 1 intentional mobile-only skip |
| Admin smoke audit | `cd frontend && BASE_URL=http://localhost:3001 npm run test:e2e:admin-portfolio` | 6 tests passing |
| Dependency audit | `cd frontend && npm audit --audit-level=moderate` | 0 vulnerabilities |
| Health monitor | `cd frontend && npm run monitor:health` | Frontend, backend, and database UP |
| Backend compile | `cd backend && mvn -q -DskipTests compile` | Pass |

## Latest Production Recovery

On **May 2, 2026**, commit [`10eccae`](https://github.com/JasonTM17/Ecommerce_BookStore/commit/10eccae0a8be15d0aac124fd85b05622eae80b4c) completed the Render, CI/CD, and security recovery pass for the existing production services.

- CI/CD: [GitHub Actions run 25247620492](https://github.com/JasonTM17/Ecommerce_BookStore/actions/runs/25247620492) completed successfully across backend tests, frontend tests, build, code quality, security scan, E2E, image publish, and production deploy.
- Render: the existing `bookstore-api` and `bookstore-web` services were redeployed without deleting or recreating service history.
- Backend health: [`/api/health/live`](https://bookstore-api-a1xl.onrender.com/api/health/live) and [`/api/health/ready`](https://bookstore-api-a1xl.onrender.com/api/health/ready) return `UP`.
- Frontend health: [`/api/health`](https://bookstore-web-dr1k.onrender.com/api/health) reports frontend `UP`, backend `UP`, and production commit `10eccae0a8be15d0aac124fd85b05622eae80b4c`.
- Security: npm audits remain clean and the Trivy high/critical baseline is enforced in CI with a pinned action.

## Quick Start

### 1. Create local environment

```powershell
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Update `.env` only when you need non-default local behavior, such as private database credentials, Grok, mail, VNPay, or flash-sale tuning.

### 2. Start with Docker Compose

```bash
docker compose up -d --build
```

Local services:

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:8080/api](http://localhost:8080/api)
- Swagger UI: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)
- Backend readiness: [http://localhost:8080/api/health/ready](http://localhost:8080/api/health/ready)

### 3. Run a production-like frontend locally

```bash
cd frontend
npm run start:local
```

`start:local` rebuilds the standalone Next.js output, prepares static assets, stops stale processes on port `3001`, and starts the same server shape used by Docker and Render.

## Local Development

Backend:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The backend `local` and `dev` profiles read the repo-root `.env` file through Spring config import, so environment variables do not need to be exported manually for normal development.

## Render Deployment

The project includes `render.yaml` for a three-resource Render deployment:

- `bookstore-db`: PostgreSQL database
- `bookstore-api`: Spring Boot backend
- `bookstore-web`: Next.js frontend

Auto deploy is intentionally disabled in the Blueprint (`autoDeployTrigger: off`) to avoid unintended free-tier pipeline usage. Deploy manually from the Render dashboard or through configured deploy hooks when pipeline minutes are available.

See [Render Deployment Guide](./docs/render-deployment-guide.md) for setup, environment variables, health checks, deploy hooks, and post-deploy verification.

## Security Notes

- Real secrets are never committed. Use `.env` locally and deployment secrets in Render/GitHub.
- `JWT_SECRET`, database credentials, mail credentials, VNPay keys, and Grok API keys must be private.
- Public health and chatbot responses are sanitized so provider errors and private user details are not exposed.
- Demo account passwords are generated through environment values for Render and should not be logged or documented as plain text.

See [Security Audit Notes](./docs/security-audit.md) for the full hardening record.

## Documentation

- [Documentation Index](./docs/README.md)
- [System Architecture and CI/CD](./docs/architecture-and-cicd.md)
- [Render Deployment Guide](./docs/render-deployment-guide.md)
- [Production Runbook](./docs/production-runbook.md)
- [Portfolio Assets](./docs/portfolio/README.md)
- [Vietnamese README](./README_VN.md)

## Repository Layout

```text
Ecommerce_BookStore/
|-- backend/          # Spring Boot REST API
|-- frontend/         # Next.js storefront and admin UI
|-- mobile/           # Expo mobile workspace
|-- docs/             # Architecture, deployment, security, runbook, portfolio assets
|-- scripts/          # Health monitoring and CI helpers
|-- docker-compose.yml
|-- Dockerfile.backend
+-- Dockerfile.frontend
```

## Project Status

The codebase is production-verified on GitHub Actions and Render. The latest recovery deploy is live on the existing Render backend and frontend services, with health checks reporting the storefront, API, and database as available.
