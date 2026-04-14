# Render.com Deployment Guide

This guide explains how to deploy the full-stack Ecommerce BookStore application to **Render.com** using the provided Infrastructure as Code (IaC) Blueprint and GitHub Actions.

## 🛠 Prerequisites

1. A [GitHub](https://github.com) account hosting this repository.
2. A [Render.com](https://render.com) account.

## 🌐 Architecture on Render

Because Render natively supports PostgreSQL, the deployment utilizes a specialized Spring Boot profile (`render`) that automatically switches the backend from MySQL to PostgreSQL. 

The infrastructure consists of 3 services:
1. **PostgreSQL Database** (Render native, Free Tier)
2. **Backend API** (Dockerized Spring Boot, Free Tier web service)
3. **Frontend Web** (Dockerized Next.js, Free Tier web service)

---

## 🚀 Step 1: Provisioning Infrastructure via Blueprint

You don't need to create services manually. We use the `render.yaml` Blueprint file located at the root of the repository to provision everything automatically.

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button in the top right corner and select **Blueprint**.
3. Connect your GitHub account and select the `Ecommerce_BookStore` repository.
4. Render will automatically detect the `render.yaml` file.
5. Click **Apply Blueprint**.

Render will now provision the PostgreSQL database and begin building and deploying both the backend and frontend Docker containers.

---

## 🔄 Step 2: Setting up Continuous Deployment (Deploy Hooks)

To make GitHub Actions automatically trigger a deployment on Render whenever code is pushed to the `master` branch, we need to bind Render's Deploy Hooks to GitHub Secrets.

1. On the **Render Dashboard**, go to the settings of your newly created **Backend** service (`bookstore-api`).
2. Scroll down to the **Deploy Hook** section and copy the unique URL.
3. Go to your **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Create a new repository secret:
   - **Name:** `RENDER_DEPLOY_HOOK_BACKEND`
   - **Secret:** *(Paste the Backend Deploy Hook URL)*
5. Repeat steps 1-4 for the **Frontend** service (`bookstore-web`):
   - **Name:** `RENDER_DEPLOY_HOOK_FRONTEND`
   - **Secret:** *(Paste the Frontend Deploy Hook URL)*

*(Optional)* If you have a staging environment on a `develop` branch, you can also set up `RENDER_DEPLOY_HOOK_BACKEND_STAGING` and `RENDER_DEPLOY_HOOK_FRONTEND_STAGING`.

---

## 🔍 Verification

Once the Blueprint finishes deploying, and next time the CI/CD pipeline runs on the `master` branch, you can verify your deployment:

1. **Frontend:** Visit `https://bookstore-web.onrender.com`. The UI should load.
2. **Backend Health Check:** Visit `https://bookstore-api.onrender.com/api/actuator/health/liveness`. It should return `{"status":"UP"}`.

> **Note on Render Free Tier Limits:**
> - Web services spin down after 15 minutes of inactivity. Accessing the site after a period of inactivity may experience a "cold start" delay of up to 50 seconds.
> - The free PostgreSQL database keeps data for 90 days.
> - If you require an "always-on" experience and persistent data, consider upgrading the services to the **Starter** tier ($7/month per service).
