import type { AxiosRequestConfig } from "axios";
import { api, apiPublic } from "./api";
import {
  getDemoActiveFlashSales,
  getDemoUpcomingFlashSales,
} from "./demo-storefront";

type RetryAwareConfig = AxiosRequestConfig & { _retry?: boolean };

const FLASH_SALE_PUBLIC_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_FLASH_SALE_TIMEOUT_MS || "12000",
);
const FLASH_SALE_PUBLIC_CACHE_TTL_MS = Number(
  process.env.NEXT_PUBLIC_FLASH_SALE_CACHE_TTL_MS || "30000",
);

const publicNoRetryConfig: RetryAwareConfig = {
  timeout: FLASH_SALE_PUBLIC_TIMEOUT_MS,
  _retry: true,
};

type FlashSaleCacheEntry = {
  expiresAt: number;
  promise: Promise<FlashSale[]>;
};

const flashSalePublicCache = new Map<string, FlashSaleCacheEntry>();

export function clearFlashSaleCacheForTests() {
  flashSalePublicCache.clear();
}

export interface FlashSale {
  id: number;
  product: {
    id: number;
    name: string;
    author: string;
    imageUrl: string;
    price: number;
    avgRating: number;
    reviewCount: number;
  };
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  startTime: string;
  endTime: string;
  stockLimit: number;
  soldCount: number;
  remainingStock: number;
  isActive: boolean;
  isStarted: boolean;
  isEnded: boolean;
  progress: number;
}

export interface FlashSaleRequest {
  productId: number;
  originalPrice: number;
  salePrice: number;
  startTime: string;
  endTime: string;
  stockLimit: number;
}

export const flashSaleApi = {
  getActiveFlashSales: async () => {
    return getCachedPublicFlashSales(
      "/flash-sales/active",
      getDemoActiveFlashSales() as FlashSale[],
    );
  },

  getUpcomingFlashSales: async () => {
    return getCachedPublicFlashSales(
      "/flash-sales/upcoming",
      getDemoUpcomingFlashSales() as FlashSale[],
    );
  },

  getFlashSaleById: async (id: number) => {
    const response = await apiPublic.get<{ data: FlashSale }>(
      `/flash-sales/${id}`,
    );
    return response.data.data;
  },

  getAllFlashSales: async (page = 0, size = 20) => {
    const response = await api.get<{ data: FlashSale[] }>(
      `/admin/flash-sales?page=${page}&size=${size}`,
    );
    return response.data.data;
  },

  createFlashSale: async (request: FlashSaleRequest) => {
    const response = await api.post<{ data: FlashSale }>(
      "/admin/flash-sales",
      request,
    );
    return response.data.data;
  },

  updateFlashSale: async (id: number, request: Partial<FlashSaleRequest>) => {
    const response = await api.put<{ data: FlashSale }>(
      `/admin/flash-sales/${id}`,
      request,
    );
    return response.data.data;
  },

  deleteFlashSale: async (id: number) => {
    await api.delete(`/admin/flash-sales/${id}`);
  },
};

async function getCachedPublicFlashSales(
  endpoint: string,
  fallback: FlashSale[],
) {
  const now = Date.now();
  const cached = flashSalePublicCache.get(endpoint);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = apiPublic
    .get<{ data: FlashSale[] }>(endpoint, publicNoRetryConfig)
    .then((response) =>
      Array.isArray(response.data.data) && response.data.data.length > 0
        ? response.data.data
        : fallback,
    )
    .catch(() => fallback);

  if (FLASH_SALE_PUBLIC_CACHE_TTL_MS > 0) {
    flashSalePublicCache.set(endpoint, {
      expiresAt: now + FLASH_SALE_PUBLIC_CACHE_TTL_MS,
      promise,
    });
  }

  return promise;
}
