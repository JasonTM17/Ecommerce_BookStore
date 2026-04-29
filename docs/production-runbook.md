# Production Runbook

This runbook defines the repeatable checks for local production verification, Render deployment, monitoring, and rollback.

## Local Production Verification

Use this sequence before pushing or opening a portfolio review.

```bash
cd frontend
npm run lint
npm run test:run
npm run build
npm audit --audit-level=moderate
```

```bash
cd backend
mvn -q -DskipTests compile
```

Start or restart local production services:

```bash
cd frontend
npm run start:local
```

Then run browser-level checks against the production-like local server:

```bash
cd frontend
BASE_URL=http://localhost:3001 npm run test:e2e:portfolio-audit
BASE_URL=http://localhost:3001 npm run test:e2e:journey
BASE_URL=http://localhost:3001 npm run test:e2e:admin-portfolio
npm run monitor:health
```

PowerShell equivalent:

```powershell
cd frontend
$env:BASE_URL = "http://localhost:3001"
npm run test:e2e:portfolio-audit
npm run test:e2e:journey
npm run test:e2e:admin-portfolio
npm run monitor:health
```

Expected local health:

- Frontend: `http://localhost:3001/api/health`
- Backend readiness: `http://localhost:8080/api/health/ready`
- Database: `UP` inside backend readiness response

## Release Checklist

Before a release commit:

- README and docs match current commands and health paths.
- `CHANGELOG.md` includes the user-facing or operational change.
- No real secrets are present in staged files.
- `git diff --cached` contains only intentional changes.
- Render auto deploy remains controlled unless the workspace has available pipeline minutes.

## Render Deploy Sequence

1. Confirm Render workspace has available pipeline minutes.
2. Confirm `render.yaml` still has the expected service names and health paths.
3. Deploy backend first if backend code, database, or env changed.
4. Wait for backend live and readiness health to pass.
5. Deploy frontend.
6. Verify frontend `/api/health` reports backend reachability.
7. Smoke test `/`, `/products`, `/flash-sale`, `/cart`, `/checkout`, and `/login`.

## Rollback

If a deployment regresses:

1. Stop triggering new deploy hooks.
2. Use Render's rollback action on the affected service if an earlier deploy is known-good.
3. If rollback is not available, redeploy the last known-good Git commit.
4. Re-run the health checks and smoke routes.
5. Record the incident and fix in the changelog or issue tracker.

## Monitoring

Local monitor:

```bash
cd frontend
npm run monitor:health
```

Production monitor targets:

- Frontend aggregate health: `https://bookstore-web-dr1k.onrender.com/api/health`
- Backend live health: `https://bookstore-api-a1xl.onrender.com/api/health/live`
- Backend readiness: `https://bookstore-api-a1xl.onrender.com/api/health/ready`

Treat these as failing conditions:

- Frontend returns non-2xx.
- Backend readiness reports database down.
- API proxy reports backend unreachable.
- Public pages show unavailable-data fallbacks for longer than a normal cold start.

## Incident Triage

| Signal | First check | Likely fix |
| --- | --- | --- |
| Frontend 500 | Render frontend logs | Bad env var, failed Next start, missing standalone assets |
| API proxy timeout | Backend health and `API_PROXY_TARGET` | Correct backend URL or wait for cold start |
| Backend unhealthy | Backend logs and DB env | Check `DATABASE_URL`, `DB_*`, and `SPRING_PROFILES_ACTIVE` |
| Database down | Render database status | Wait for service recovery or restore credentials |
| Chatbot degraded | `/api/chatbot/health` | Keep Grok disabled or verify provider key/latency |

## Documentation Aftercare

After any production-facing change:

- Update README if setup, verification, screenshots, or product scope changed.
- Update Render docs if `render.yaml` changed.
- Update security notes if auth, headers, CORS, secrets, provider calls, or dependency posture changed.
- Regenerate portfolio screenshots if UI changed.
