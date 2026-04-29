"use client";

type ClientLogLevel = "error" | "warning" | "info";

type ClientLogPayload = {
  component?: string;
  digest?: string;
  level?: ClientLogLevel;
  message: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  name?: string;
  stack?: string;
};

const MAX_FIELD_LENGTH = 1200;
const seenClientErrors = new Set<string>();

function truncate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value.length > MAX_FIELD_LENGTH
    ? `${value.slice(0, MAX_FIELD_LENGTH)}...`
    : value;
}

function sanitizePayload(payload: ClientLogPayload) {
  const metadata = payload.metadata
    ? Object.fromEntries(
        Object.entries(payload.metadata).map(([key, value]) => [
          key,
          typeof value === "string" ? truncate(value) : value,
        ]),
      )
    : undefined;

  return {
    component: truncate(payload.component),
    digest: truncate(payload.digest),
    level: payload.level || "error",
    message: truncate(payload.message) || "Unknown client error",
    metadata,
    name: truncate(payload.name),
    path:
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : undefined,
    stack: truncate(payload.stack),
    userAgent:
      typeof navigator !== "undefined"
        ? truncate(navigator.userAgent)
        : undefined,
  };
}

export function logClientError(payload: ClientLogPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const sanitized = sanitizePayload(payload);
  const fingerprint = [
    sanitized.level,
    sanitized.component,
    sanitized.name,
    sanitized.message,
    sanitized.path,
  ].join("|");

  if (seenClientErrors.has(fingerprint)) {
    return;
  }
  seenClientErrors.add(fingerprint);

  const body = JSON.stringify(sanitized);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/client-errors", blob)) {
      return;
    }
  }

  void fetch("/api/client-errors", {
    body,
    cache: "no-store",
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => {
    // Logging must never break the user journey.
  });
}

export function logWebVitalMetric(metric: {
  id: string;
  name: string;
  rating?: string;
  value: number;
}) {
  if (process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS_LOGGING !== "true") {
    return;
  }

  logClientError({
    component: "WebVitals",
    level: metric.rating === "poor" ? "warning" : "info",
    message: `Web vital ${metric.name}`,
    metadata: {
      id: metric.id,
      name: metric.name,
      rating: metric.rating,
      value: Math.round(metric.value),
    },
  });
}
