import { api } from "./api";

export interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    author: string;
    imageUrl: string;
    price: number;
    currentPrice: number;
    avgRating: number;
    reviewCount: number;
    stockQuantity: number;
    discountPercent: number;
    isNew: boolean;
    isBestseller: boolean;
  };
  notes: string | null;
  priority: number;
  isInStock: boolean;
  createdAt: string;
}

export const wishlistApi = {
  getWishlist: async (paginated = false, page = 0, size = 20) => {
    const params = paginated ? `?paginated=true&page=${page}&size=${size}` : "";
    const response = await api.get<{ data: WishlistItem[] }>(`/wishlist${params}`);
    return response.data.data;
  },

  addToWishlist: async (productId: number) => {
    const response = await api.post<{ data: WishlistItem }>(`/wishlist/${productId}`);
    return response.data.data;
  },

  removeFromWishlist: async (productId: number) => {
    await api.delete(`/wishlist/${productId}`);
  },

  checkInWishlist: async (productId: number) => {
    const response = await api.get<{ data: { isInWishlist: boolean } }>(
      `/wishlist/${productId}`
    );
    return response.data.data.isInWishlist;
  },

  getWishlistCount: async () => {
    const response = await api.get<{ data: { count: number } }>("/wishlist/count");
    return response.data.data.count;
  },

  updateNotes: async (productId: number, notes: string) => {
    await api.patch(`/wishlist/${productId}/notes`, { notes });
  },

  updatePriority: async (productId: number, priority: number) => {
    await api.patch(`/wishlist/${productId}/priority`, { priority });
  },
};
