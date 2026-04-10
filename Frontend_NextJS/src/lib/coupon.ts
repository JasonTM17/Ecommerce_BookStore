import { api } from "./api";

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

export const couponApi = {
  getAvailableCoupons: async () => {
    const response = await api.get<{ data: Coupon[] }>("/coupons/available");
    return response.data.data;
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
