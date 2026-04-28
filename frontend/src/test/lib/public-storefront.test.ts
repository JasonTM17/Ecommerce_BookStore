import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  apiPublic: {
    get: vi.fn(() => Promise.reject(new Error("backend unavailable"))),
  },
}));

import {
  getPublicCategories,
  getPublicFeaturedProducts,
  getPublicProductsPage,
} from "@/lib/public-storefront";
import { apiPublic } from "@/lib/api";

describe("public storefront fallbacks", () => {
  const apiPublicGet = vi.mocked(apiPublic.get);

  beforeEach(() => {
    apiPublicGet.mockRejectedValue(new Error("backend unavailable"));
  });

  it("keeps category and featured product sections populated when the API is unavailable", async () => {
    await expect(getPublicCategories()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Sách Văn Học" }),
      ]),
    );

    await expect(getPublicFeaturedProducts()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Atomic Habits" }),
      ]),
    );
  });

  it("returns a paginated demo catalog instead of throwing on product list failure", async () => {
    const page = await getPublicProductsPage({
      keyword: "atomic",
      page: 0,
      size: 12,
    });

    expect(page.totalElements).toBeGreaterThan(0);
    expect(page.content[0]).toEqual(
      expect.objectContaining({ name: "Atomic Habits" }),
    );
  });

  it("uses the demo catalog when the public API returns an empty page", async () => {
    apiPublicGet.mockResolvedValueOnce({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        page: 0,
        size: 12,
      },
    });

    const page = await getPublicProductsPage({ page: 0, size: 12 });

    expect(page.totalElements).toBeGreaterThan(0);
    expect(page.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Atomic Habits" }),
      ]),
    );
  });
});
