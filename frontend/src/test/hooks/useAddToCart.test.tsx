import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Product } from "@/lib/types";
import { useAddToCart } from "@/hooks/useAddToCart";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

const pushMock = vi.fn();
const setCartMock = vi.fn();
const authState = { isAuthenticated: true };

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
  }),
}));

vi.mock("@/lib/store", () => ({
  useCartStore: () => ({
    setCart: setCartMock,
  }),
}));

vi.mock("@/components/ui/toaster", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: 10,
  name: "Clean Architecture",
  price: 220000,
  currentPrice: 180000,
  stockQuantity: 20,
  inStock: true,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAddToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    window.history.replaceState({}, "", "/products/10");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("redirects unauthenticated users to login with the current path", () => {
    authState.isAuthenticated = false;

    const { result } = renderHook(() => useAddToCart("/products"), {
      wrapper: createWrapper(),
    });

    result.current.addToCart(mockProduct);

    expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fproducts%2F10");
    expect(toast.info).toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("posts to the cart API and syncs the cart store for authenticated users", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        items: [{ id: 1, product: mockProduct, quantity: 1, subtotal: 180000 }],
        totalItems: 1,
        total: 180000,
      },
    });

    const { result } = renderHook(() => useAddToCart("/products"), {
      wrapper: createWrapper(),
    });

    result.current.addToCart(mockProduct);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/cart/items", {
        productId: mockProduct.id,
        quantity: 1,
      });
    });

    expect(setCartMock).toHaveBeenCalledWith(
      [{ id: 1, product: mockProduct, quantity: 1, subtotal: 180000 }],
      1,
      180000
    );
    expect(toast.success).toHaveBeenCalled();
  });
});
