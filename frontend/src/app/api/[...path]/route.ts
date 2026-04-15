import { NextRequest, NextResponse } from "next/server";
import { resolveProxyTargets } from "@/lib/server/api-proxy";

const REQUEST_TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS || "65000");
const INTERNAL_PROXY_TIMEOUT_MS = Math.min(
  REQUEST_TIMEOUT_MS,
  Number(process.env.API_PROXY_INTERNAL_TIMEOUT_MS || "8000"),
);

function buildTargetUrl(
  request: NextRequest,
  pathSegments: string[],
  baseUrl: string,
) {
  const joinedPath = pathSegments.join("/");
  const search = request.nextUrl.search || "";
  return `${baseUrl}/${joinedPath}${search}`;
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  return headers;
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
  const targets = resolveProxyTargets(process.env);
  let timeoutFailure = false;
  let lastError: unknown;

  try {
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const controller = new AbortController();
      const timeoutMs =
        index === 0 && targets.length > 1
          ? INTERNAL_PROXY_TIMEOUT_MS
          : REQUEST_TIMEOUT_MS;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(
          buildTargetUrl(request, pathSegments, target),
          {
            method: request.method,
            headers: copyRequestHeaders(request),
            body,
            cache: "no-store",
            redirect: "manual",
            signal: controller.signal,
          },
        );

        const headers = new Headers(response.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");
        headers.delete("transfer-encoding");

        return new NextResponse(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        lastError = error;
        timeoutFailure =
          timeoutFailure ||
          (error instanceof Error && error.name === "AbortError");

        if (index === targets.length - 1) {
          throw error;
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }
  } catch (error) {
    lastError = error;
    const message =
      timeoutFailure ||
      (lastError instanceof Error && lastError.name === "AbortError")
        ? "Backend request timed out"
        : "Backend service is unavailable";

    return NextResponse.json(
      {
        success: false,
        message,
        status: 502,
      },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function HEAD(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const { path } = context.params;
  return proxyRequest(request, path);
}
