import { describe, expect, it } from "vitest";
import {
  getCategoryPlaceholderImage,
  isLocalBookAssetPath,
  resolveProductImageSource,
} from "@/lib/product-images";

describe("product image helpers", () => {
  it("detects local book assets for direct delivery", () => {
    expect(
      isLocalBookAssetPath("/images/books/covers/9780735211292-L.jpg"),
    ).toBe(true);
    expect(isLocalBookAssetPath("/images/books/placeholders/default.svg")).toBe(
      true,
    );
    expect(
      isLocalBookAssetPath("https://covers.openlibrary.org/b/id/1-L.jpg"),
    ).toBe(false);
    expect(isLocalBookAssetPath(undefined)).toBe(false);
  });

  it("prefers local cover assets before remote candidates", () => {
    expect(
      resolveProductImageSource({
        imageUrl: "https://covers.openlibrary.org/b/id/1-L.jpg",
        images: ["/images/books/covers/9780735211292-L.jpg"],
        category: { name: "Khoa Học" },
      }),
    ).toBe("/images/books/covers/9780735211292-L.jpg");
  });

  it("falls back to category placeholder when no image exists", () => {
    const fallback = getCategoryPlaceholderImage("Lịch Sử");

    expect(
      resolveProductImageSource({
        imageUrl: null,
        images: [],
        category: { name: "Lịch Sử" },
      }),
    ).toBe(fallback);
  });
});
