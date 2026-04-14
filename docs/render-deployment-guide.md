# Render.com Deployment Guide

This guide explains how to deploy Ecommerce BookStore to **Render.com** with the repository Blueprint (`render.yaml`) and the current GitHub Actions pipeline.

## Prerequisites

1. A GitHub repository containing this project.
2. A [Render](https://render.com/) account.
3. Permission to manage GitHub Actions secrets if you want automated deploy hooks.

## Render deployment layout

The current Blueprint provisions three resources:

1. **PostgreSQL database**: `bookstore-db`
2. **Backend API**: `bookstore-api`
3. **Frontend web**: `bookstore-web`

The backend runs with the `render` Spring profile and uses two database configuration strategies (in priority order):

1. **`DATABASE_URL`** (primary) — `RenderDataSourceConfig.java` automatically parses the Render-provided connection string (`postgresql://user:pass@host:port/db`) into a valid JDBC URL with separate credentials. This is the recommended approach.
2. **Individual `DB_*` vars** (fallback) — `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` are used if `DATABASE_URL` is not present.

> Note: The PostgreSQL JDBC driver does not accept credentials embedded in the URL. `RenderDataSourceConfig` handles this conversion transparently.

## Step 1: Provision infrastructure with the Blueprint

1. Open the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect the `Ecommerce_BookStore` repository.
4. Confirm that Render detects `render.yaml`.
5. Click **Apply Blueprint**.

Render will create the PostgreSQL database and start building both Docker services from source.

## Step 2: Configure deploy hooks for GitHub Actions

If you want GitHub Actions to trigger redeploys on pushes to `master`:

1. Open the `bookstore-api` service in Render.
2. Copy the URL from the **Deploy Hook** section.
3. In GitHub, open **Settings** -> **Secrets and variables** -> **Actions**.
4. Add a repository secret:
   - `RENDER_DEPLOY_HOOK_BACKEND`
5. Repeat the process for `bookstore-web`:
   - `RENDER_DEPLOY_HOOK_FRONTEND`

Optional staging secrets for `develop`:

- `RENDER_DEPLOY_HOOK_BACKEND_STAGING`
- `RENDER_DEPLOY_HOOK_FRONTEND_STAGING`

> If a deploy hook was ever exposed, rotate it in Render and replace the corresponding GitHub secret.

## Step 3: Validate backend configuration on Render

For `bookstore-api`, confirm the following:

- `SPRING_PROFILES_ACTIVE=render`
- Health check path: `/api/actuator/health/liveness`
- Build source: `Dockerfile.backend`
- Database binding provides `DATABASE_URL` (primary) and the `DB_*` variables (fallback) from `bookstore-db`

## Professional image tags

GitHub Actions now publishes images to **GHCR** and **Docker Hub** with semver-first tags:

- `latest`
- `v1.0.0`
- `v1`

These tags are intended for registry artifacts. Render Blueprint/source deploy history will still display **commit hashes**, which is expected behavior for source-based deployments.

## Post-deploy verification

After deployment completes, verify:

1. **Backend liveness**
   - `https://bookstore-api.onrender.com/api/actuator/health/liveness`
   - Expected response: `{"status":"UP"}`
2. **Frontend root**
   - `https://bookstore-web.onrender.com`
   - Expected result: the current Next.js BookStore portfolio UI
3. **API proxy**
   - Frontend requests through `/api` should resolve against the backend
4. **Smoke key routes**
   - `/products`
   - `/products/[id]`
   - `/flash-sale`
   - `/checkout`

## Notes on the Render free tier

- Free web services can spin down after inactivity, so the first request may be slow.
- Demo data may continue topping up briefly after the backend becomes healthy.
- For a permanently warm portfolio environment, consider upgrading from the free tier or using periodic warm-up traffic.
