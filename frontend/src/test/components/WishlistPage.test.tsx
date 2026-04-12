import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WishlistPage } from "@/components/wishlist/WishlistPage";

const pushMock = vi.fn();
const addToCartMock = vi.fn();
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

vi.mock("@/hooks/useAddToCart", () => ({
  useAddToCart: () => ({
    addToCart: addToCartMock,
    isAddingToCart: false,
  }),
}));

vi.mock("@/hooks/useWishlist", () => ({
  useWishlist: () => ({
    wishlistItems: [
      {
        id: 1,
        product: {
          id: 15,
          name: "Dế Mèn Phiêu Lưu Ký",
          author: "Tô Hoài",
          imageUrl: "https://example.com/de-men.jpg",
          price: 120000,
          currentPrice: 99000,
          avgRating: 4.8,
          reviewCount: 42,
          stockQuantity: 12,
          discountPercent: 18,
          isNew: true,
          isBestseller: true,
        },
        notes: "Đọc cuối tuần",
        priority: 1,
        isInStock: true,
        createdAt: "2026-04-12T00:00:00.000Z",
      },
    ],
    isLoading: false,
    removeFromWishlist: vi.fn(),
  }),
}));

describe("WishlistPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
  });

  it("wires the wishlist add-to-cart CTA to the shared cart flow", () => {
    render(<WishlistPage />);

    fireEvent.click(screen.getByRole("button", { name: /thêm vào giỏ/i }));

    expect(addToCartMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 15,
        name: "Dế Mèn Phiêu Lưu Ký",
        inStock: true,
      }),
      1
    );
  });

  it("preserves the wishlist redirect when login is required", () => {
    authState.isAuthenticated = false;

    render(<WishlistPage />);

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fwishlist");
  });
});
