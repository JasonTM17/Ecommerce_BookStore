import { api, apiPublic } from "./api";

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
    const response = await apiPublic.get<{ data: FlashSale[] }>("/flash-sales/active");
    return response.data.data;
  },

  getUpcomingFlashSales: async () => {
    const response = await apiPublic.get<{ data: FlashSale[] }>("/flash-sales/upcoming");
    return response.data.data;
  },

  getFlashSaleById: async (id: number) => {
    const response = await apiPublic.get<{ data: FlashSale }>(`/flash-sales/${id}`);
    return response.data.data;
  },

  getAllFlashSales: async (page = 0, size = 20) => {
    const response = await api.get<{ data: FlashSale[] }>(
      `/admin/flash-sales?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  createFlashSale: async (request: FlashSaleRequest) => {
    const response = await api.post<{ data: FlashSale }>("/admin/flash-sales", request);
    return response.data.data;
  },

  updateFlashSale: async (id: number, request: Partial<FlashSaleRequest>) => {
    const response = await api.put<{ data: FlashSale }>(`/admin/flash-sales/${id}`, request);
    return response.data.data;
  },

  deleteFlashSale: async (id: number) => {
    await api.delete(`/admin/flash-sales/${id}`);
  },
};
