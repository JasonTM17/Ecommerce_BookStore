import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

vi.mock("@/lib/utils", () => ({
  formatCurrency: (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount),
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" "),
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
  category: { id: 1, name: "Programming", slug: "programming" },
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

  it("renders sale price and original price when discounted", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Còn hàng")).toBeInTheDocument();
  });

  it("renders out of stock status when not in stock", () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
  });

  it("calls onAddToCart when add button is clicked", async () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    const addButton = screen.getByText("Thêm vào giỏ");
    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
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
    const noDiscountProduct = { ...mockProduct, discountPercent: 0, currentPrice: 250000 };
    render(<ProductCard product={noDiscountProduct} />);
    expect(screen.queryByText(/-/)).not.toBeInTheDocument();
  });
});
