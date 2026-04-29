import { api, apiPublic } from "./api";

export interface Coupon {
  id: number;
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  isPublic: boolean;
  isValid: boolean;
  isExpired: boolean;
  discountDisplay: string;
  createdAt: string;
}

export interface CouponRequest {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  isPublic?: boolean;
  applicableCategories?: number[];
  applicableProducts?: number[];
}

export interface CouponValidationRequest {
  code: string;
  orderTotal?: number;
}

const PUBLIC_COUPON_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_COUPON_TIMEOUT_MS || "6000",
);

const publicCouponNoRetryConfig = {
  timeout: PUBLIC_COUPON_TIMEOUT_MS,
  _retry: true,
};

const demoPublicCoupons: Coupon[] = [
  {
    id: 101,
    code: "BOOKLOVER50K",
    description: "Giảm 50.000đ cho đơn hàng từ 399.000đ",
    type: "FIXED_AMOUNT",
    discountValue: 50000,
    minOrderAmount: 399000,
    maxDiscount: 50000,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z",
    usageLimit: 500,
    usedCount: 126,
    perUserLimit: 1,
    isActive: true,
    isPublic: true,
    isValid: true,
    isExpired: false,
    discountDisplay: "Giảm 50.000đ",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 102,
    code: "FREESHIP",
    description: "Miễn phí vận chuyển cho đơn hàng từ 120.000đ",
    type: "FREE_SHIPPING",
    discountValue: 0,
    minOrderAmount: 120000,
    maxDiscount: 30000,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z",
    usageLimit: 1000,
    usedCount: 342,
    perUserLimit: 2,
    isActive: true,
    isPublic: true,
    isValid: true,
    isExpired: false,
    discountDisplay: "Miễn phí vận chuyển",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 103,
    code: "SPRING25",
    description: "Giảm 25% cho sách nổi bật, tối đa 80.000đ",
    type: "PERCENTAGE",
    discountValue: 25,
    minOrderAmount: 250000,
    maxDiscount: 80000,
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z",
    usageLimit: 300,
    usedCount: 88,
    perUserLimit: 1,
    isActive: true,
    isPublic: true,
    isValid: true,
    isExpired: false,
    discountDisplay: "Giảm 25%",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export const couponApi = {
  getAvailableCoupons: async () => {
    try {
      const response = await apiPublic.get<{ data: Coupon[] }>(
        "/coupons/available",
        publicCouponNoRetryConfig,
      );
      return Array.isArray(response.data.data) && response.data.data.length > 0
        ? response.data.data
        : demoPublicCoupons;
    } catch {
      return demoPublicCoupons;
    }
  },

  getAllCoupons: async (page = 0, size = 20) => {
    const response = await api.get<{ data: Coupon[] }>(
      `/coupons?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  getCouponById: async (id: number) => {
    const response = await api.get<{ data: Coupon }>(`/coupons/${id}`);
    return response.data.data;
  },

  createCoupon: async (request: CouponRequest) => {
    const response = await api.post<{ data: Coupon }>("/coupons", request);
    return response.data.data;
  },

  updateCoupon: async (id: number, request: CouponRequest) => {
    const response = await api.put<{ data: Coupon }>(`/coupons/${id}`, request);
    return response.data.data;
  },

  deleteCoupon: async (id: number) => {
    await api.delete(`/coupons/${id}`);
  },

  validateCoupon: async (code: string, orderTotal?: number) => {
    const response = await api.post<{ data: Coupon }>("/coupons/validate", {
      code,
      orderTotal,
    });
    return response.data.data;
  },

  searchCoupons: async (keyword: string, page = 0, size = 20) => {
    const response = await api.get<{ data: Coupon[] }>(
      `/coupons/search?keyword=${keyword}&page=${page}&size=${size}`
    );
    return response.data.data;
  },
};
