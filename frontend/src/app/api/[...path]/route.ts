import { NextRequest, NextResponse } from "next/server";
import { resolveProxyTarget } from "@/lib/server/api-proxy";

const REQUEST_TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS || "65000");

function buildTargetUrl(request: NextRequest, pathSegments: string[]) {
  const baseUrl = resolveProxyTarget(process.env);
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    const response = await fetch(buildTargetUrl(request, pathSegments), {
      method: request.method,
      headers: copyRequestHeaders(request),
      body,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

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
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Backend request timed out"
        : "Backend service is unavailable";

    return NextResponse.json(
      {
        success: false,
        message,
        status: 502,
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function HEAD(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxyRequest(request, path);
}
