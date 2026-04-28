import type { AxiosRequestConfig } from "axios";
import { apiPublic } from "@/lib/api";
import {
  demoBrands,
  demoCategories,
  demoRootCategories,
  getDemoFeaturedProducts,
  getDemoNewProducts,
  getDemoProductsByCategory,
  getDemoProductsPage,
  paginateDemoProducts,
} from "@/lib/demo-storefront";
import type { Brand, Category, PageResponse, Product } from "@/lib/types";

type RetryAwareConfig = AxiosRequestConfig & { _retry?: boolean };

const PUBLIC_STOREFRONT_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_STOREFRONT_TIMEOUT_MS || "12000",
);
const PUBLIC_STOREFRONT_CACHE_TTL_MS = Number(
  process.env.NEXT_PUBLIC_STOREFRONT_CACHE_TTL_MS || "30000",
);

const noRetryConfig: RetryAwareConfig = {
  timeout: PUBLIC_STOREFRONT_TIMEOUT_MS,
  _retry: true,
};

type PublicPayloadCacheEntry = {
  expiresAt: number;
  promise: Promise<unknown>;
};

const publicPayloadCache = new Map<string, PublicPayloadCacheEntry>();

export function clearPublicStorefrontCacheForTests() {
  publicPayloadCache.clear();
}

export function normalizePublicList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as PageResponse<T>).content)
  ) {
    return (data as PageResponse<T>).content;
  }

  return [];
}

function normalizePublicPage<T>(
  data: unknown,
  fallback: PageResponse<T>,
): PageResponse<T> {
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as PageResponse<T>).content)
  ) {
    return data as PageResponse<T>;
  }

  if (Array.isArray(data)) {
    return {
      ...fallback,
      content: data as T[],
      totalElements: data.length,
      totalPages: data.length > 0 ? 1 : 0,
    };
  }

  return fallback;
}

function isEmptyPublicPayload(value: unknown) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (
    value &&
    typeof value === "object" &&
    "content" in value &&
    Array.isArray((value as PageResponse<unknown>).content)
  ) {
    return (value as PageResponse<unknown>).content.length === 0;
  }

  return false;
}

function normalizeText(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function filterAndSortProducts(
  products: Product[],
  {
    keyword,
    categoryId,
    brandId,
    sortBy,
  }: {
    keyword?: string;
    categoryId?: string | null;
    brandId?: string | null;
    sortBy?: string;
  },
) {
  const normalizedKeyword = normalizeText(keyword);
  const filtered = products.filter((product) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [product.name, product.author, product.publisher, product.category?.name]
        .filter(Boolean)
        .some((value) => normalizeText(value).includes(normalizedKeyword));
    const matchesCategory =
      !categoryId ||
      categoryId === "all" ||
      product.category?.id.toString() === categoryId ||
      product.category?.parentId?.toString() === categoryId;
    const matchesBrand =
      !brandId || brandId === "all" || product.brand?.id.toString() === brandId;

    return matchesKeyword && matchesCategory && matchesBrand;
  });

  switch (sortBy) {
    case "price_asc":
      return filtered.sort((a, b) => a.currentPrice - b.currentPrice);
    case "price_desc":
      return filtered.sort((a, b) => b.currentPrice - a.currentPrice);
    case "name_asc":
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return filtered.sort((a, b) => {
        const left = a.updatedAt ? new Date(a.updatedAt).getTime() : a.id;
        const right = b.updatedAt ? new Date(b.updatedAt).getTime() : b.id;
        return right - left;
      });
  }
}

async function getPublicPayload(endpoint: string) {
  const now = Date.now();
  const cached = publicPayloadCache.get(endpoint);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = apiPublic
    .get(endpoint, noRetryConfig)
    .then((response) => response.data);

  if (PUBLIC_STOREFRONT_CACHE_TTL_MS > 0) {
    publicPayloadCache.set(endpoint, {
      expiresAt: now + PUBLIC_STOREFRONT_CACHE_TTL_MS,
      promise,
    });
  }

  return promise;
}

async function getWithFallback<T>(
  endpoint: string,
  fallback: T,
  normalize: (data: unknown, fallback: T) => T = (data) => data as T,
) {
  try {
    const payload = await getPublicPayload(endpoint);
    const normalized = normalize(payload, fallback);
    return isEmptyPublicPayload(normalized) && !isEmptyPublicPayload(fallback)
      ? fallback
      : normalized;
  } catch {
    return fallback;
  }
}

export function getPublicCategories() {
  return getWithFallback<Category[]>("/categories", demoCategories, (data) =>
    normalizePublicList<Category>(data),
  );
}

export function getPublicRootCategories() {
  return getWithFallback<Category[]>(
    "/categories/root",
    demoRootCategories,
    (data) => normalizePublicList<Category>(data),
  );
}

export function getPublicBrands() {
  return getWithFallback<Brand[]>("/brands", demoBrands, (data) =>
    normalizePublicList<Brand>(data),
  );
}

export function getPublicFeaturedProducts() {
  return getWithFallback<Product[]>(
    "/products/featured",
    getDemoFeaturedProducts(),
    (data) => normalizePublicList<Product>(data),
  );
}

export function getPublicNewProducts() {
  return getWithFallback<Product[]>(
    "/products/new",
    getDemoNewProducts(),
    (data) => normalizePublicList<Product>(data),
  );
}

export function getPublicProductsPage({
  collectionMode,
  keyword,
  categoryId,
  brandId,
  sortBy,
  page,
  size,
}: {
  collectionMode?: "featured" | "new" | null;
  keyword?: string;
  categoryId?: string | null;
  brandId?: string | null;
  sortBy?: string;
  page?: number;
  size?: number;
}) {
  const fallback =
    collectionMode === "featured"
      ? paginateDemoProducts(getDemoFeaturedProducts(), page, size)
      : collectionMode === "new"
        ? paginateDemoProducts(getDemoNewProducts(), page, size)
        : getDemoProductsPage({
            keyword,
            categoryId,
            brandId,
            sortBy,
            page,
            size,
          });

  if (collectionMode) {
    const endpoint =
      collectionMode === "featured" ? "/products/featured" : "/products/new";
    return getWithFallback<PageResponse<Product>>(
      endpoint,
      fallback,
      (data) => {
        const products = filterAndSortProducts(
          normalizePublicList<Product>(data),
          { keyword, categoryId, brandId, sortBy },
        );
        return paginateDemoProducts(products, page, size);
      },
    );
  }

  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (categoryId && categoryId !== "all")
    params.append("categoryId", categoryId);
  if (brandId && brandId !== "all") params.append("brandId", brandId);
  if (sortBy) params.append("sortBy", sortBy);
  params.append("page", String(page || 0));
  params.append("size", String(size || 12));

  return getWithFallback<PageResponse<Product>>(
    `/products?${params.toString()}`,
    fallback,
    normalizePublicPage,
  );
}

export function getPublicProductsByCategory(
  categoryId: string | null,
  page = 0,
  size = 12,
) {
  const fallback = getDemoProductsByCategory(categoryId, page, size);

  if (!categoryId) {
    return Promise.resolve(fallback);
  }

  return getWithFallback<PageResponse<Product>>(
    `/products/category/${categoryId}?page=${page}&size=${size}`,
    fallback,
    normalizePublicPage,
  );
}
