import { afterAll, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCartStore } from "@/lib/store";
import type { CartItem, Product } from "@/lib/store";

// Mock localStorage for persist middleware
const originalLocalStorage = globalThis.localStorage;
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

afterAll(() => {
  vi.stubGlobal("localStorage", originalLocalStorage);
});

const mockProduct: Product = {
  id: 1,
  name: "Test Book",
  price: 100000,
  currentPrice: 80000,
  stockQuantity: 50,
  inStock: true,
  imageUrl: "https://example.com/book.jpg",
};

const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 1,
  product: mockProduct,
  quantity: 1,
  subtotal: 80000,
  ...overrides,
});

describe("useCartStore", () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("starts with empty cart", () => {
      const { result } = renderHook(() => useCartStore());
      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.total).toBe(0);
    });

    it("starts with isLoading false", () => {
      const { result } = renderHook(() => useCartStore());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("setCart", () => {
    it("sets cart with items", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 2, subtotal: 160000 }),
      ];

      act(() => {
        result.current.setCart(items, 2, 160000);
      });

      expect(result.current.items).toEqual(items);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.total).toBe(160000);
    });
  });

  describe("clearCart", () => {
    it("clears all items", () => {
      const { result } = renderHook(() => useCartStore());

      // Add item first
      act(() => {
        result.current.setCart([createMockCartItem()], 1, 80000);
      });

      expect(result.current.items.length).toBe(1);

      // Clear cart
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe("addItem", () => {
    it("adds new item to cart", () => {
      const { result } = renderHook(() => useCartStore());
      const newItem = createMockCartItem({
        id: 1,
        quantity: 1,
        subtotal: 80000,
      });

      act(() => {
        result.current.addItem(newItem);
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0]).toEqual(newItem);
    });

    it("increases quantity when adding existing item", () => {
      const { result } = renderHook(() => useCartStore());
      const product = { ...mockProduct, id: 1 };
      const item1 = createMockCartItem({
        id: 1,
        product,
        quantity: 1,
        subtotal: 80000,
      });
      const item2 = createMockCartItem({
        id: 1,
        product,
        quantity: 2,
        subtotal: 160000,
      });

      act(() => {
        result.current.addItem(item1);
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].quantity).toBe(1);

      act(() => {
        result.current.addItem(item2);
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].quantity).toBe(3); // 1 + 2
      expect(result.current.items[0].subtotal).toBe(240000); // 3 * 80000
    });

    it("adds multiple different items", () => {
      const { result } = renderHook(() => useCartStore());
      const item1 = createMockCartItem({
        id: 1,
        product: { ...mockProduct, id: 1 },
        quantity: 1,
        subtotal: 80000,
      });
      const item2 = createMockCartItem({
        id: 2,
        product: { ...mockProduct, id: 2 },
        quantity: 2,
        subtotal: 160000,
      });

      act(() => {
        result.current.addItem(item1);
        result.current.addItem(item2);
      });

      expect(result.current.items.length).toBe(2);
    });
  });

  describe("removeItem", () => {
    it("removes item by id", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 1, subtotal: 80000 }),
        createMockCartItem({ id: 2, quantity: 2, subtotal: 160000 }),
      ];

      act(() => {
        result.current.setCart(items, 3, 240000);
      });

      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].id).toBe(2);
    });

    it("updates totalItems and total after removal", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 1, subtotal: 80000 }),
        createMockCartItem({ id: 2, quantity: 2, subtotal: 160000 }),
      ];

      act(() => {
        result.current.setCart(items, 3, 240000);
      });

      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.totalItems).toBe(2);
      expect(result.current.total).toBe(160000);
    });
  });

  describe("updateQuantity", () => {
    it("updates item quantity", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 1, subtotal: 80000 }),
      ];

      act(() => {
        result.current.setCart(items, 1, 80000);
      });

      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.items[0].subtotal).toBe(400000); // 5 * 80000
    });

    it("removes item when quantity is 0 or less", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 1, subtotal: 80000 }),
      ];

      act(() => {
        result.current.setCart(items, 1, 80000);
      });

      act(() => {
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.items.length).toBe(0);
    });

    it("respects minimum quantity of 1", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 1, subtotal: 80000 }),
      ];

      act(() => {
        result.current.setCart(items, 1, 80000);
      });

      act(() => {
        result.current.updateQuantity(1, -1);
      });

      // Should remove item instead of negative quantity
      expect(result.current.items.length).toBe(0);
    });
  });

  describe("Cart Total Calculation", () => {
    it("calculates totalItems correctly", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 2, subtotal: 160000 }),
        createMockCartItem({ id: 2, quantity: 3, subtotal: 240000 }),
      ];

      act(() => {
        result.current.setCart(items, 5, 400000);
      });

      expect(result.current.totalItems).toBe(5);
    });

    it("calculates total correctly", () => {
      const { result } = renderHook(() => useCartStore());
      const items = [
        createMockCartItem({ id: 1, quantity: 2, subtotal: 160000 }),
        createMockCartItem({ id: 2, quantity: 3, subtotal: 240000 }),
      ];

      act(() => {
        result.current.setCart(items, 5, 400000);
      });

      expect(result.current.total).toBe(400000);
    });
  });

  describe("setLoading", () => {
    it("sets loading state", () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
