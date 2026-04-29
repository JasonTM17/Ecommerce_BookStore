import { NextRequest, NextResponse } from "next/server";
import {
  isCacheablePublicProxyGet,
  resolveProxyTargets,
  shouldFallbackProxyResponseStatus,
} from "@/lib/server/api-proxy";
import {
  demoBrands,
  demoCategories,
  demoRootCategories,
  demoProducts,
  getDemoActiveFlashSales,
  getDemoFeaturedProducts,
  getDemoNewProducts,
  getDemoProductsPage,
  getDemoUpcomingFlashSales,
} from "@/lib/demo-storefront";

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
const PUBLIC_PROXY_STALE_TTL_MS = Number(
  process.env.API_PROXY_PUBLIC_STALE_TTL_MS || "300000",
);
const PUBLIC_PROXY_RETRY_DELAY_MS = Number(
  process.env.API_PROXY_PUBLIC_RETRY_DELAY_MS || "250",
);
const PUBLIC_PROXY_RETRIES = Number(
  process.env.API_PROXY_PUBLIC_RETRIES || "2",
);

type PublicProxyCacheEntry = {
  expiresAt: number;
  staleUntil: number;
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
  const headers = new Headers();
  const forwardedHeaders = [
    "accept",
    "authorization",
    "content-type",
    "x-request-id",
  ];

  forwardedHeaders.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });

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

function buildJsonCacheEntry(
  payload: unknown,
  cacheTtlMs: number,
): PublicProxyCacheEntry {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const body = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );

  return {
    expiresAt: Date.now() + cacheTtlMs,
    staleUntil: Date.now() + cacheTtlMs + PUBLIC_PROXY_STALE_TTL_MS,
    status: 200,
    statusText: "OK",
    headers: [
      ["content-type", "application/json"],
      ["cache-control", "no-store"],
      ["x-bookstore-proxy-fallback", "demo"],
    ],
    body,
  };
}

function buildApiSuccessPayload(data: unknown, message: string) {
  return {
    success: true,
    data,
    message,
    timestamp: Date.now(),
  };
}

function buildDemoProductDetail(productId: number) {
  const product = demoProducts.find((item) => item.id === productId);
  if (!product) {
    return null;
  }

  const activeSale = getDemoActiveFlashSales().find(
    (sale) => sale.product.id === product.id,
  );

  if (!activeSale) {
    return product;
  }

  return {
    ...product,
    activeFlashSale: {
      id: activeSale.id,
      endTime: activeSale.endTime,
      remainingStock: activeSale.remainingStock,
      stockLimit: activeSale.stockLimit,
      soldCount: activeSale.soldCount,
    },
    currentPrice: activeSale.salePrice,
    discountPercent: activeSale.discountPercent,
  };
}

function getDemoCoupons() {
  const startDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 7001,
      code: "BOOKSTORE10",
      description: "Giảm 10% cho đơn sách từ 200.000đ.",
      type: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 200000,
      maxDiscount: 50000,
      startDate,
      endDate,
      usageLimit: 1000,
      usedCount: 120,
      perUserLimit: 1,
      isActive: true,
      isPublic: true,
      isValid: true,
      isExpired: false,
      discountDisplay: "Giảm 10%",
      createdAt: startDate,
    },
    {
      id: 7002,
      code: "FREESHIP",
      description: "Miễn phí vận chuyển cho đơn từ 150.000đ.",
      type: "FREE_SHIPPING",
      discountValue: 0,
      minOrderAmount: 150000,
      maxDiscount: 30000,
      startDate,
      endDate,
      usageLimit: 1000,
      usedCount: 95,
      perUserLimit: 1,
      isActive: true,
      isPublic: true,
      isValid: true,
      isExpired: false,
      discountDisplay: "Miễn phí vận chuyển",
      createdAt: startDate,
    },
  ];
}

function buildPublicFallbackEntry(
  request: NextRequest,
  pathSegments: string[],
): PublicProxyCacheEntry | null {
  const joinedPath = pathSegments.join("/");
  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") || "0");
  const size = Number(params.get("size") || "12");
  const fallbackTtlMs = Math.max(PUBLIC_PROXY_CACHE_TTL_MS, 30000);
  let data: unknown;
  let wrapInApiSuccess = true;

  switch (joinedPath) {
    case "products":
      data = getDemoProductsPage({
        keyword: params.get("keyword") || "",
        categoryId: params.get("categoryId"),
        brandId: params.get("brandId"),
        sortBy: params.get("sortBy") || "newest",
        page,
        size,
      });
      wrapInApiSuccess = false;
      break;
    case "products/featured":
      data = getDemoFeaturedProducts();
      break;
    case "products/new":
      data = getDemoNewProducts();
      break;
    case "categories":
      data = demoCategories;
      break;
    case "categories/root":
      data = demoRootCategories;
      break;
    case "brands":
      data = demoBrands;
      break;
    case "flash-sales/active":
      data = getDemoActiveFlashSales();
      break;
    case "flash-sales/upcoming":
      data = getDemoUpcomingFlashSales();
      break;
    case "coupons/available":
      data = getDemoCoupons();
      break;
    case "chatbot/health":
      data = {
        status: "DISABLED",
        service: "BookStore Demo Assistant",
        model: "portfolio-demo",
        message: "Demo assistant is available while the AI provider is offline.",
        providerEnabled: "false",
      };
      break;
    default:
      {
        const productDetailMatch = joinedPath.match(/^products\/(\d+)$/);
        if (productDetailMatch) {
          const product = buildDemoProductDetail(Number(productDetailMatch[1]));
          if (!product) {
            return null;
          }
          data = product;
          wrapInApiSuccess = false;
          break;
        }

        const categoryProductsMatch = joinedPath.match(
          /^products\/category\/(\d+)$/,
        );
        if (categoryProductsMatch) {
          data = getDemoProductsPage({
            categoryId: categoryProductsMatch[1],
            page,
            size,
            sortBy: params.get("sortBy") || "newest",
          });
          wrapInApiSuccess = false;
          break;
        }

        const relatedMatch = joinedPath.match(/^products\/(\d+)\/related$/);
        if (relatedMatch) {
          const currentProduct = demoProducts.find(
            (item) => item.id === Number(relatedMatch[1]),
          );
          data = demoProducts
            .filter(
              (item) =>
                item.id !== currentProduct?.id &&
                item.category?.id === currentProduct?.category?.id,
            )
            .slice(0, 5);
          wrapInApiSuccess = false;
          break;
        }

        const reviewsMatch = joinedPath.match(/^reviews\/product\/(\d+)$/);
        if (reviewsMatch) {
          data = {
            content: [],
            page,
            size,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
          };
          wrapInApiSuccess = false;
          break;
        }

        return null;
      }
  }

  return buildJsonCacheEntry(
    wrapInApiSuccess
      ? buildApiSuccessPayload(
          data,
          "Using portfolio fallback data while the backend warms up.",
        )
      : data,
    fallbackTtlMs,
  );
}

function buildPublicFallbackResponse(
  request: NextRequest,
  pathSegments: string[],
  cacheKey: string | null,
) {
  const fallbackEntry = buildPublicFallbackEntry(request, pathSegments);
  if (!fallbackEntry) {
    return null;
  }

  if (cacheKey) {
    publicProxyCache.set(cacheKey, fallbackEntry);
  }

  return buildCachedProxyResponse(fallbackEntry);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getProxyAttemptCount(cacheablePublicGet: boolean) {
  if (!cacheablePublicGet) {
    return 1;
  }

  return Math.max(1, PUBLIC_PROXY_RETRIES + 1);
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
        let response: Response | undefined;
        const attemptCount = getProxyAttemptCount(cacheablePublicGet);

        for (let attempt = 0; attempt < attemptCount; attempt += 1) {
          try {
            response = await fetch(
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
          } catch (error) {
            lastError = error;

            if (
              attempt < attemptCount - 1 &&
              !(error instanceof Error && error.name === "AbortError")
            ) {
              await delay(PUBLIC_PROXY_RETRY_DELAY_MS * (attempt + 1));
              continue;
            }

            throw error;
          }

          if (!shouldFallbackProxyResponseStatus(response.status)) {
            break;
          }

          lastError = new Error(
            `Proxy target returned retryable status ${response.status}`,
          );

          if (attempt < attemptCount - 1) {
            await response.body?.cancel().catch(() => undefined);
            await delay(PUBLIC_PROXY_RETRY_DELAY_MS * (attempt + 1));
            continue;
          }
        }

        if (!response) {
          throw lastError instanceof Error
            ? lastError
            : new Error("Proxy target did not return a response");
        }

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
            staleUntil:
              Date.now() +
              PUBLIC_PROXY_CACHE_TTL_MS +
              PUBLIC_PROXY_STALE_TTL_MS,
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

        if (
          cacheKey &&
          shouldFallbackProxyResponseStatus(response.status) &&
          PUBLIC_PROXY_STALE_TTL_MS > 0
        ) {
          const cached = publicProxyCache.get(cacheKey);
          if (cached && cached.staleUntil > Date.now()) {
            await response.body?.cancel().catch(() => undefined);
            return buildCachedProxyResponse(cached);
          }
        }

        if (cacheKey && shouldFallbackProxyResponseStatus(response.status)) {
          await response.body?.cancel().catch(() => undefined);
          const fallbackResponse = buildPublicFallbackResponse(
            request,
            pathSegments,
            cacheKey,
          );
          if (fallbackResponse) {
            return fallbackResponse;
          }
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
          if (cacheKey && PUBLIC_PROXY_STALE_TTL_MS > 0) {
            const cached = publicProxyCache.get(cacheKey);
            if (cached && cached.staleUntil > Date.now()) {
              return buildCachedProxyResponse(cached);
            }
          }

          const fallbackResponse = buildPublicFallbackResponse(
            request,
            pathSegments,
            cacheKey,
          );
          if (fallbackResponse) {
            return fallbackResponse;
          }

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

    const cacheKey = isCacheablePublicProxyGet(request.method, pathSegments)
      ? getPublicProxyCacheKey(request, pathSegments)
      : null;
    const fallbackResponse = buildPublicFallbackResponse(
      request,
      pathSegments,
      cacheKey,
    );
    if (fallbackResponse) {
      return fallbackResponse;
    }

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
