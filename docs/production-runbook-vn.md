# Production Runbook

Runbook này định nghĩa các bước lặp lại để verify production local, deploy Render, monitoring và rollback.

## Verify production local

Chạy chuỗi này trước khi push hoặc gửi repo cho người review portfolio.

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

Start hoặc restart production local:

```bash
cd frontend
npm run start:local
```

Sau đó chạy browser-level checks trên server local production:

```bash
cd frontend
BASE_URL=http://localhost:3001 npm run test:e2e:portfolio-audit
BASE_URL=http://localhost:3001 npm run test:e2e:journey
BASE_URL=http://localhost:3001 npm run test:e2e:admin-portfolio
npm run monitor:health
```

PowerShell:

```powershell
cd frontend
$env:BASE_URL = "http://localhost:3001"
npm run test:e2e:portfolio-audit
npm run test:e2e:journey
npm run test:e2e:admin-portfolio
npm run monitor:health
```

Health local kỳ vọng:

- Frontend: `http://localhost:3001/api/health`
- Backend readiness: `http://localhost:8080/api/health/ready`
- Database: `UP` trong backend readiness response

## Release checklist

Trước khi commit release:

- README và docs khớp với command/health path hiện tại.
- `CHANGELOG.md` ghi lại thay đổi ảnh hưởng tới người dùng hoặc vận hành.
- Không có secret thật trong staged files.
- `git diff --cached` chỉ chứa thay đổi có chủ đích.
- Render auto deploy vẫn được kiểm soát, trừ khi workspace có đủ pipeline minutes và muốn deploy ngay.

## Trình tự deploy Render

1. Xác nhận Render workspace còn pipeline minutes.
2. Xác nhận `render.yaml` vẫn đúng service name và health path.
3. Deploy backend trước nếu có thay đổi backend, database hoặc env.
4. Chờ backend live/readiness health pass.
5. Deploy frontend.
6. Verify frontend `/api/health` thấy backend reachable.
7. Smoke test `/`, `/products`, `/flash-sale`, `/cart`, `/checkout`, `/login`.

## Rollback

Nếu deploy bị regression:

1. Dừng trigger deploy hook mới.
2. Dùng rollback action trên Render cho service bị ảnh hưởng nếu có deploy known-good.
3. Nếu không rollback được, redeploy Git commit known-good gần nhất.
4. Chạy lại health checks và smoke routes.
5. Ghi lại incident và fix trong changelog hoặc issue tracker.

## Monitoring

Monitor local:

```bash
cd frontend
npm run monitor:health
```

Production monitor targets:

- Frontend aggregate health: `https://bookstore-web-dr1k.onrender.com/api/health`
- Backend live health: `https://bookstore-api-a1xl.onrender.com/api/health/live`
- Backend readiness: `https://bookstore-api-a1xl.onrender.com/api/health/ready`

Xem là fail khi:

- Frontend trả non-2xx.
- Backend readiness báo database down.
- API proxy báo backend unreachable.
- Public pages hiển thị unavailable-data fallback lâu hơn thời gian cold start bình thường.

## Incident triage

| Signal | Kiểm tra đầu tiên | Hướng xử lý thường gặp |
| --- | --- | --- |
| Frontend 500 | Render frontend logs | Sai env var, Next start fail, thiếu standalone assets |
| API proxy timeout | Backend health và `API_PROXY_TARGET` | Sửa backend URL hoặc chờ cold start |
| Backend unhealthy | Backend logs và DB env | Kiểm tra `DATABASE_URL`, `DB_*`, `SPRING_PROFILES_ACTIVE` |
| Database down | Render database status | Chờ service recovery hoặc kiểm tra credentials |
| Chatbot degraded | `/api/chatbot/health` | Giữ Grok disabled hoặc kiểm tra provider key/latency |

## Sau khi thay đổi production-facing

- Update README nếu setup, verification, screenshot hoặc product scope thay đổi.
- Update Render docs nếu `render.yaml` thay đổi.
- Update security notes nếu auth, headers, CORS, secrets, provider call hoặc dependency posture thay đổi.
- Regenerate portfolio screenshots nếu UI thay đổi.
