import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ===== Types =====
export interface Product {
  id: number;
  name: string;
  author?: string;
  publisher?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  currentPrice: number;
  stockQuantity: number;
  inStock: boolean;
  imageUrl?: string;
  images?: string[];
  category?: Category;
  brand?: Brand;
  avgRating?: number;
  reviewCount?: number;
  soldCount?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  parentId?: number;
  subcategories?: Category[];
  productCount?: number;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: string[];
  createdAt?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
}

export interface Address {
  id: number;
  receiverName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  fullAddress: string;
  postalCode?: string;
  isDefault: boolean;
  addressType: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderStatus: string;
  orderStatusDisplayName: string;
  paymentStatus: string;
  paymentStatusDisplayName: string;
  orderItems: OrderItem[];
  shippingAddress: string;
  shippingPhone: string;
  shippingReceiverName: string;
  shippingMethod?: string;
  shippingFee: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Review {
  id: number;
  user: User;
  productId: number;
  rating: number;
  comment?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: string;
}

// ===== Auth Store =====
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ===== Cart Store =====
interface CartState {
  items: CartItem[];
  totalItems: number;
  total: number;
  isLoading: boolean;
  setCart: (items: CartItem[], totalItems: number, total: number) => void;
  clearCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      total: 0,
      isLoading: false,
      setCart: (items, totalItems, total) => set({ items, totalItems, total }),
      clearCart: () => set({ items: [], totalItems: 0, total: 0 }),
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id || i.product.id === item.product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              (i.id === item.id || i.product.id === item.product.id)
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    subtotal: i.product.currentPrice * (i.quantity + item.quantity),
                  }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (itemId) => {
        const items = get().items.filter((i) => i.id !== itemId);
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const total = items.reduce((sum, i) => sum + i.subtotal, 0);
        set({ items, totalItems, total });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        const items = get().items.map((i) =>
          i.id === itemId
            ? { ...i, quantity, subtotal: i.product.currentPrice * quantity }
            : i
        );
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const total = items.reduce((sum, i) => sum + i.subtotal, 0);
        set({ items, totalItems, total });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        total: state.total,
      }),
    }
  )
);

// ===== UI Store =====
interface UIState {
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  toggleCart: () => void;
  toggleSearch: () => void;
  toggleMenu: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCartOpen: false,
  isSearchOpen: false,
  isMenuOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeAll: () => set({ isCartOpen: false, isSearchOpen: false, isMenuOpen: false }),
}));
