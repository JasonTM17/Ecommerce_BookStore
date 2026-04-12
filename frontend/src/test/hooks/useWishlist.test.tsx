import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWishlist } from "@/hooks/useWishlist";
import React from "react";

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@example.com", fullName: "Test User" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/wishlist", () => ({
  wishlistApi: {
    getWishlist: vi.fn(),
    getWishlistCount: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    isInWishlist: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
}));

import { wishlistApi } from "@/lib/wishlist";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useWishlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (wishlistApi.getWishlist as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (wishlistApi.getWishlistCount as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (wishlistApi.addToWishlist as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (wishlistApi.removeFromWishlist as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  it("returns empty wishlist initially", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.wishlistItems).toEqual([]);
    });
  });

  it("returns zero count initially", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.wishlistCount).toBe(0);
    });
  });

  it("isInWishlist returns false for unknown product", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isInWishlist(999)).toBe(false);
    });
  });

  it("adds product to wishlist when authenticated", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addToWishlist(1);
    });

    expect(wishlistApi.addToWishlist).toHaveBeenCalledWith(1);
  });

  it("removes product from wishlist", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeFromWishlist(1);
    });

    expect(wishlistApi.removeFromWishlist).toHaveBeenCalledWith(1);
  });

  it("toggles wishlist adds when not in wishlist", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleWishlist(1);
    });

    expect(wishlistApi.addToWishlist).toHaveBeenCalledWith(1);
  });

  it("toggles wishlist removes when already in wishlist", async () => {
    const wishlistWithItem = [
      { product: { id: 1, name: "Test Book" } },
    ];
    (wishlistApi.getWishlist as ReturnType<typeof vi.fn>).mockResolvedValue(wishlistWithItem);

    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleWishlist(1);
    });

    expect(wishlistApi.removeFromWishlist).toHaveBeenCalledWith(1);
  });

  it("isInWishlist returns true for product in wishlist", async () => {
    const wishlistWithItem = [
      { product: { id: 42, name: "Test Book" } },
    ];
    (wishlistApi.getWishlist as ReturnType<typeof vi.fn>).mockResolvedValue(wishlistWithItem);

    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isInWishlist(42)).toBe(true);
    });
  });
});
