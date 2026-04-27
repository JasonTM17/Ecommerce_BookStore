import { NextResponse } from "next/server";
import { resolveProxyTargets } from "@/lib/server/api-proxy";

const BACKEND_HEALTH_TIMEOUT_MS = Number(
  process.env.API_HEALTH_BACKEND_TIMEOUT_MS || "5000",
);

type BackendHealthCheck = {
  index: number;
  ok: boolean;
  status?: number;
  durationMs: number;
  error?: string;
};

async function checkBackendTarget(
  target: string,
  index: number,
): Promise<BackendHealthCheck> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    BACKEND_HEALTH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${target}/health/ready`, {
      cache: "no-store",
      signal: controller.signal,
    });

    return {
      index,
      ok: response.ok,
      status: response.status,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      index,
      ok: false,
      durationMs: Date.now() - startedAt,
      error:
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : "unavailable",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  const targets = resolveProxyTargets(process.env);
  const checks = await Promise.all(targets.map(checkBackendTarget));
  const backendUp = checks.some((check) => check.ok);

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      frontend: {
        status: "UP",
      },
      backend: {
        status: backendUp ? "UP" : "DEGRADED",
        targetCount: targets.length,
        checks,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
