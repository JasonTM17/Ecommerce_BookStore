import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CategoriesPage from "@/app/categories/page";
import { api } from "@/lib/api";

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}));

vi.mock("@/hooks/useAddToCart", () => ({
  useAddToCart: () => ({
    addToCart: vi.fn(),
    isAddingToCart: false,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === "/categories") {
        return {
          data: [
            {
              id: 1,
              name: "Sách Văn Học",
              productCount: 12,
              subcategories: [
                { id: 11, name: "Tiểu Thuyết", productCount: 0 },
                { id: 12, name: "Truyện Ngắn", productCount: 4 },
              ],
            },
          ],
        };
      }

      if (url.startsWith("/products/category/")) {
        return {
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 12,
          },
        };
      }

      return { data: [] };
    });
  });

  it("does not render a glued zero-count badge for empty subcategories", async () => {
    renderWithQueryClient(<CategoriesPage />);

    expect(await screen.findByText("Tiểu Thuyết")).toBeInTheDocument();
    expect(screen.queryByText("0 sách")).not.toBeInTheDocument();
    expect(screen.getByText("4 sách")).toBeInTheDocument();
  });
});
