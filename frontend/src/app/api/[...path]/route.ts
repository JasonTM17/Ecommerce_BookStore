import { NextRequest, NextResponse } from "next/server";
import {
  isCacheablePublicProxyGet,
  resolveProxyTargets,
  shouldFallbackProxyResponseStatus,
} from "@/lib/server/api-proxy";

const REQUEST_TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS || "65000");
const INTERNAL_PROXY_TIMEOUT_MS = Math.min(
  REQUEST_TIMEOUT_MS,
  Number(process.env.API_PROXY_INTERNAL_TIMEOUT_MS || "8000"),
);
const STRIPPED_PROXY_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "content-security-policy",
  "permissions-policy",
  "referrer-policy",
  "strict-transport-security",
  "transfer-encoding",
  "x-content-type-options",
  "x-frame-options",
  "x-xss-protection",
];
const PUBLIC_PROXY_CACHE_TTL_MS = Number(
  process.env.API_PROXY_PUBLIC_CACHE_TTL_MS || "30000",
);

type PublicProxyCacheEntry = {
  expiresAt: number;
  status: number;
  statusText: string;
  headers: [string, string][];
  body: ArrayBuffer;
};

const publicProxyCache = new Map<string, PublicProxyCacheEntry>();

type ApiRouteContext = {
  params: Promise<{ path: string[] }>;
};

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

function getPublicProxyCacheKey(request: NextRequest, pathSegments: string[]) {
  return `${pathSegments.join("/")}${request.nextUrl.search || ""}`;
}

function buildCachedProxyResponse(entry: PublicProxyCacheEntry) {
  return new NextResponse(entry.body.slice(0), {
    status: entry.status,
    statusText: entry.statusText,
    headers: new Headers(entry.headers),
  });
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
  const targets = resolveProxyTargets(process.env);
  let timeoutFailure = false;
  let lastError: unknown;
  const cacheablePublicGet = isCacheablePublicProxyGet(
    request.method,
    pathSegments,
  );
  const cacheKey = cacheablePublicGet
    ? getPublicProxyCacheKey(request, pathSegments)
    : null;

  if (cacheKey) {
    const cached = publicProxyCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return buildCachedProxyResponse(cached);
    }
  }

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

        if (
          index < targets.length - 1 &&
          shouldFallbackProxyResponseStatus(response.status)
        ) {
          lastError = new Error(
            `Proxy target returned retryable status ${response.status}`,
          );
          await response.body?.cancel().catch(() => undefined);
          continue;
        }

        const headers = new Headers(response.headers);
        STRIPPED_PROXY_RESPONSE_HEADERS.forEach((header) => {
          headers.delete(header);
        });

        if (cacheKey && response.ok && PUBLIC_PROXY_CACHE_TTL_MS > 0) {
          const responseBody = await response.arrayBuffer();
          publicProxyCache.set(cacheKey, {
            expiresAt: Date.now() + PUBLIC_PROXY_CACHE_TTL_MS,
            status: response.status,
            statusText: response.statusText,
            headers: Array.from(headers.entries()),
            body: responseBody,
          });

          return new NextResponse(responseBody.slice(0), {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }

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

export async function GET(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function HEAD(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: ApiRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
