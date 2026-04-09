import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: string[];
}

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
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    author?: string;
    imageUrl?: string;
    currentPrice: number;
    discountPrice?: number;
    inStock: boolean;
  };
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  total: number;
  setCart: (items: CartItem[], totalItems: number, total: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      total: 0,
      setCart: (items, totalItems, total) =>
        set({ items, totalItems, total }),
      clearCart: () => set({ items: [], totalItems: 0, total: 0 }),
    }),
    {
      name: "cart-storage",
    }
  )
);

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
