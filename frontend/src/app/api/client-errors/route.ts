import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_SIZE = 12_000;
const MAX_FIELD_LENGTH = 1200;

type ClientErrorPayload = {
  component?: string;
  digest?: string;
  level?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  path?: string;
  stack?: string;
  userAgent?: string;
};

function truncate(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.length > MAX_FIELD_LENGTH
    ? `${value.slice(0, MAX_FIELD_LENGTH)}...`
    : value;
}

function sanitizePayload(payload: ClientErrorPayload) {
  return {
    component: truncate(payload.component),
    digest: truncate(payload.digest),
    level:
      payload.level === "warning" || payload.level === "info"
        ? payload.level
        : "error",
    message: truncate(payload.message) || "Unknown client error",
    metadata:
      payload.metadata && typeof payload.metadata === "object"
        ? Object.fromEntries(
            Object.entries(payload.metadata).map(([key, value]) => [
              key.slice(0, 80),
              typeof value === "string" ? truncate(value) : value,
            ]),
          )
        : undefined,
    name: truncate(payload.name),
    path: truncate(payload.path),
    stack: truncate(payload.stack),
    userAgent: truncate(payload.userAgent),
  };
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let payload: ClientErrorPayload;
  try {
    payload = (await request.json()) as ClientErrorPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sanitized = sanitizePayload(payload);
  const logPayload = {
    ...sanitized,
    timestamp: new Date().toISOString(),
  };

  if (sanitized.level === "error") {
    console.error("[client-error]", logPayload);
  } else if (sanitized.level === "warning") {
    console.warn("[client-warning]", logPayload);
  } else {
    console.info("[client-info]", logPayload);
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
