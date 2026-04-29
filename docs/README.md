# Project Documentation

This folder contains the operational and portfolio documentation for BookStore Commerce Platform. The docs are written for reviewers, future maintainers, and deployment operators.

## Start Here

1. [System Architecture and CI/CD](./architecture-and-cicd.md) - application boundaries, request flow, data profiles, and quality gates.
2. [Render Deployment Guide](./render-deployment-guide.md) - Blueprint setup, environment variables, deploy hooks, health checks, and Render free-tier notes.
3. [Production Runbook](./production-runbook.md) - local production verification, deploy sequence, rollback, monitoring, and incident response.
4. [Security Audit Notes](./security-audit.md) - hardening changes, dependency audit status, and remaining security recommendations.
5. [Portfolio Assets](./portfolio/README.md) - tracked preview images, generated screenshots, and regeneration workflow.

## Vietnamese Documentation

- [Vietnamese Documentation Index](./README_VN.md)
- [Vietnamese README](../README_VN.md)

## Documentation Standards

- Keep commands copy-pasteable from the repository root unless the command explicitly starts with `cd`.
- Keep Render URLs and health paths aligned with `render.yaml`.
- Do not document real passwords, API keys, deploy hooks, tokens, or private database credentials.
- Update the changelog whenever a user-facing, operational, or portfolio-facing feature changes.
