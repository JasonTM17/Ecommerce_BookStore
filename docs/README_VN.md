# Tài liệu dự án

Thư mục này chứa tài liệu vận hành và portfolio cho BookStore Commerce Platform. Tài liệu được viết cho người review repo, người bảo trì sau này và người thực hiện deploy.

## Nên đọc theo thứ tự

1. [Kiến trúc hệ thống và CI/CD](./architecture-and-cicd-vn.md) - ranh giới frontend/backend, request flow, data profile và quality gates.
2. [Hướng dẫn Deploy Render](./render-deployment-guide-vn.md) - Blueprint, biến môi trường, deploy hooks, health checks và lưu ý free tier.
3. [Production Runbook](./production-runbook-vn.md) - verify production local, trình tự deploy, rollback, monitoring và xử lý sự cố.
4. [Security Audit Notes](./security-audit.md) - hardening, dependency audit và khuyến nghị bảo mật còn lại.
5. [Portfolio Assets](./portfolio/README.md) - ảnh preview được track, screenshot full-size và cách generate lại.

## Tài liệu tiếng Anh

- [English Documentation Index](./README.md)
- [English README](../README.md)

## Chuẩn viết tài liệu

- Command phải copy-paste được từ root repo, trừ khi command đã có `cd` rõ ràng.
- URL Render và health path phải khớp với `render.yaml`.
- Không ghi mật khẩu thật, API key, deploy hook, token hoặc database credential riêng tư vào tài liệu.
- Cập nhật changelog khi có thay đổi ảnh hưởng tới người dùng, vận hành hoặc cách trình bày portfolio.
