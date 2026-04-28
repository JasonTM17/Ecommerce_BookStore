import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

const pushMock = vi.fn();
const toggleWishlistMock = vi.fn();
const authState = { isAuthenticated: true };
const wishlistState = {
  isWishlisted: false,
  isAdding: false,
  isRemoving: false,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/products",
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    t: (key: string) =>
      (
        ({
          "common.noImage": "Chưa có ảnh bìa",
          "common.newArrival": "Mới",
          "common.bestseller": "Bán chạy",
          "common.addToCart": "Thêm vào giỏ hàng",
          "common.addingToCart": "Đang thêm...",
          "common.inStock": "Còn hàng",
          "common.outOfStock": "Hết hàng",
          "common.reviews": "đánh giá",
          "common.addToWishlist": "Thêm vào danh sách yêu thích",
          "common.removeFromWishlist": "Xóa khỏi danh sách yêu thích",
        }) as Record<string, string>
      )[key] ?? key,
  }),
}));

vi.mock("@/hooks/useWishlist", () => ({
  useWishlist: () => ({
    isInWishlist: () => wishlistState.isWishlisted,
    toggleWishlist: toggleWishlistMock,
    isAdding: wishlistState.isAdding,
    isRemoving: wishlistState.isRemoving,
  }),
}));

vi.mock("@/lib/utils", () => ({
  formatCurrency: (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount),
  buildLoginRedirect: (target?: string | null) =>
    `/login?redirect=${encodeURIComponent(
      target && target.startsWith("/") && !target.startsWith("//")
        ? target
        : "/",
    )}`,
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(" "),
}));

const mockProduct: Product = {
  id: 1,
  name: "Clean Code",
  slug: "clean-code",
  description: "A handbook of agile software craftsmanship",
  price: 250000,
  currentPrice: 200000,
  discountPercent: 20,
  stockQuantity: 50,
  inStock: true,
  imageUrl: "https://example.com/clean-code.jpg",
  category: { id: 1, name: "Programming" },
  author: "Robert C. Martin",
  avgRating: 4.5,
  reviewCount: 120,
  isNew: false,
  isFeatured: true,
  isBestseller: true,
};

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    wishlistState.isWishlisted = false;
    wishlistState.isAdding = false;
    wishlistState.isRemoving = false;
  });

  it("renders product name correctly", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
  });

  it("renders product author", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Robert C. Martin")).toBeInTheDocument();
  });

  it("renders discount badge when product has discount", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("renders bestseller badge", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Bán chạy")).toBeInTheDocument();
  });

  it("renders stock status when the product is available", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Còn hàng")).toBeInTheDocument();
  });

  it("renders out of stock status when not in stock", () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getAllByText("Hết hàng").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /hết hàng/i })).toBeDisabled();
  });

  it("calls onAddToCart when add button is clicked", () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByRole("button", { name: /thêm vào giỏ hàng/i }));

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("redirects unauthenticated users to login when the wishlist button is clicked", () => {
    authState.isAuthenticated = false;

    render(<ProductCard product={mockProduct} />);

    fireEvent.click(
      screen.getByRole("button", { name: /thêm vào danh sách yêu thích/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fproducts");
    expect(toggleWishlistMock).not.toHaveBeenCalled();
  });

  it("toggles the real wishlist flow for authenticated users", () => {
    render(<ProductCard product={mockProduct} />);

    fireEvent.click(
      screen.getByRole("button", { name: /thêm vào danh sách yêu thích/i }),
    );

    expect(toggleWishlistMock).toHaveBeenCalledWith(mockProduct.id);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("renders category name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Programming")).toBeInTheDocument();
  });

  it("renders new badge when product is new", () => {
    const newProduct = { ...mockProduct, isNew: true };
    render(<ProductCard product={newProduct} />);
    expect(screen.getByText("Mới")).toBeInTheDocument();
  });

  it("does not render discount badge when no discount", () => {
    const noDiscountProduct = {
      ...mockProduct,
      discountPercent: 0,
      currentPrice: 250000,
    };
    const { container } = render(<ProductCard product={noDiscountProduct} />);
    expect(screen.queryByText("-20%")).not.toBeInTheDocument();
    expect(container.textContent?.split(/\s+/)).not.toContain("0");
  });

  it("does not render a stray zero when rating is zero", () => {
    const noRatingProduct = { ...mockProduct, avgRating: 0, reviewCount: 0 };
    const { container } = render(<ProductCard product={noRatingProduct} />);
    expect(container.textContent?.split(/\s+/)).not.toContain("0");
  });
});
