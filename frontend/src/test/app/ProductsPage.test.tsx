import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductsPage from "@/app/products/page";
import { apiPublic } from "@/lib/api";

const localeState = { locale: "vi" as "vi" | "en" };

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div>{product.name}</div>
  ),
}));

vi.mock("@/hooks/useAddToCart", () => ({
  useAddToCart: () => ({
    addToCart: vi.fn(),
    isAddingToCart: false,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: localeState.locale,
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("focus=search"),
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

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localeState.locale = "vi";

    vi.mocked(apiPublic.get).mockImplementation(async (url: string) => {
      if (url.startsWith("/products?")) {
        return {
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 12,
          },
        };
      }

      if (url === "/categories" || url === "/brands") {
        return { data: [] };
      }

      return { data: [] };
    });
  });

  it("focuses the canonical search input when focus=search is present", async () => {
    renderWithQueryClient(<ProductsPage />);

    const searchInput = await screen.findByRole("searchbox");

    await waitFor(() => {
      expect(searchInput).toHaveFocus();
    });
  });

  it("switches the visible product heading with locale", async () => {
    localeState.locale = "en";

    renderWithQueryClient(<ProductsPage />);

    expect(
      await screen.findByRole("heading", { name: "All products" }),
    ).toBeInTheDocument();
  });

  it("renders fallback catalog content when product loading fails", async () => {
    vi.mocked(apiPublic.get).mockRejectedValue(
      new Error("backend unavailable"),
    );

    renderWithQueryClient(<ProductsPage />);

    expect(await screen.findByText("Atomic Habits")).toBeInTheDocument();
    expect(
      screen.queryByText("Chưa thể tải danh sách sách"),
    ).not.toBeInTheDocument();
  });
});
