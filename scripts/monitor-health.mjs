#!/usr/bin/env node

const DEFAULT_TARGETS = [
  "http://localhost:3001/api/health",
  "http://localhost:8080/api/health/ready",
];

const timeoutMs = Number(process.env.HEALTHCHECK_TIMEOUT_MS || "8000");
const webhookUrl = process.env.HEALTHCHECK_WEBHOOK_URL || "";
const targets = (process.env.HEALTHCHECK_URLS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const urls = targets.length > 0 ? targets : DEFAULT_TARGETS;

function withTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
    url,
  };
}

function collectHealthIssues(value, path = "body") {
  if (!value || typeof value !== "object") {
    return [];
  }

  const issues = [];
  if ("status" in value && typeof value.status === "string") {
    const normalizedStatus = value.status.trim().toUpperCase();
    if (!["OK", "UP", "HEALTHY"].includes(normalizedStatus)) {
      issues.push(`${path}.status=${value.status}`);
    }
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (nestedValue && typeof nestedValue === "object") {
      issues.push(...collectHealthIssues(nestedValue, `${path}.${key}`));
    }
  }

  return issues;
}

async function checkUrl(url) {
  const startedAt = Date.now();
  const timeout = withTimeout(url);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: timeout.signal,
    });

    let body = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await response.json().catch(() => null);
    }

    const healthIssues = collectHealthIssues(body);

    return {
      body,
      durationMs: Date.now() - startedAt,
      healthIssues,
      httpOk: response.ok,
      ok: response.ok && healthIssues.length === 0,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      durationMs: Date.now() - startedAt,
      error:
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : error instanceof Error
            ? error.message
            : "unknown",
      ok: false,
      url,
    };
  } finally {
    timeout.clear();
  }
}

async function sendAlert(payload) {
  if (!webhookUrl) {
    return;
  }

  await fetch(webhookUrl, {
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" },
    method: "POST",
  }).catch((error) => {
    console.warn(
      JSON.stringify({
        message: "Health alert webhook failed",
        error: error instanceof Error ? error.message : "unknown",
      }),
    );
  });
}

const checks = await Promise.all(urls.map(checkUrl));
const failed = checks.filter((check) => !check.ok);
const payload = {
  checkedAt: new Date().toISOString(),
  failed,
  ok: failed.length === 0,
  service: process.env.HEALTHCHECK_SERVICE_NAME || "bookstore",
  checks,
};

console.log(JSON.stringify(payload, null, 2));

if (failed.length > 0) {
  await sendAlert({
    ...payload,
    text: `${payload.service} health check failed for ${failed.length}/${checks.length} target(s).`,
  });
  process.exitCode = 1;
}
