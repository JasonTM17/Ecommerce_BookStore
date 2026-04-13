# BookStore

Portfolio full-stack bookstore built with Spring Boot, Next.js, MySQL, Docker Compose, Vitest, Playwright, and GitHub Actions.

## Stack

- `backend/`: Spring Boot 3.2, JPA/Hibernate, JWT auth, MySQL, Swagger, Actuator
- `frontend/`: Next.js 14 App Router, Tailwind CSS, Vitest, Playwright
- `mobile/`: mobile app workspace kept for future expansion

## Demo-first quick start

1. Create local environment variables:

   ```bash
   copy .env.example .env
   ```

2. Update `.env` if needed:
   - database credentials
   - `GROK_ENABLED=true` and `GROK_API_KEY=...` if you want Grok enabled locally
   - `FLASHSALE_AUTO_*` if you want to tune the weekly flash sale rotation

3. Start the full stack:

   ```bash
   docker compose up -d --build
   ```

4. Open the demo:
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:8080/api](http://localhost:8080/api)
   - Swagger UI: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)
   - Health check: [http://localhost:8080/api/actuator/health/liveness](http://localhost:8080/api/actuator/health/liveness)

## Local development

### Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

To use the `dev` profile instead:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend local/dev reads the repo-root `.env` file through Spring config import, so you do not need to manually export `GROK_*`, mail, or flash-sale automation variables first.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Weekly flash sale automation

The backend now supports a weekly auto-rotation for flash sale campaigns.

- Default schedule: `00:05` every Monday
- Timezone: `Asia/Bangkok`
- Default batch size: `4` books
- Default discount range: `15% - 30%`
- Default stock window: `20 - 60`
- Safety rule: skip generation if an active or upcoming campaign already overlaps the next week window

Supported environment variables:

- `FLASHSALE_AUTO_ENABLED`
- `FLASHSALE_AUTO_CRON`
- `FLASHSALE_AUTO_TIMEZONE`
- `FLASHSALE_AUTO_BATCH_SIZE`
- `FLASHSALE_AUTO_DISCOUNT_MIN`
- `FLASHSALE_AUTO_DISCOUNT_MAX`
- `FLASHSALE_AUTO_STOCK_MIN`
- `FLASHSALE_AUTO_STOCK_MAX`
- `FLASHSALE_AUTO_MAX_PER_USER`

## Testing

```bash
# Backend
cd backend && mvn test

# Frontend unit tests
cd frontend && npm run test:run

# Frontend production build
cd frontend && npm run build
```

Portfolio smoke path:

```bash
docker compose up -d --build
cd frontend && BASE_URL=http://localhost:3001 npm run test:e2e:portfolio
```

## Chatbot and Grok

- `GROK_ENABLED=false` by default
- Set `GROK_ENABLED=true` together with `GROK_API_KEY` to enable Grok in local/dev or Docker
- Frontend chatbot health is driven by `/api/chatbot/health`

## Repository layout

```text
Ecommerce_BookStore/
|-- backend/          # Spring Boot REST API
|-- frontend/         # Next.js 14 App Router
|-- docs/             # Project documentation
|-- scripts/          # CI/E2E helper scripts
|-- docker-compose.yml
|-- Dockerfile.backend
+-- Dockerfile.frontend
```

## Notes

- This repository is optimized for portfolio and demo flows first.
- CI coverage gates are kept honest against the current baseline.
- Do not commit real secrets — always use `.env` (gitignored) for local overrides.
