/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductDetailPage from "@/app/products/[id]/page";
import { apiPublic } from "@/lib/api";

const localeState = { locale: "vi" as "vi" | "en" };
const pushMock = vi.fn();

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

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

vi.mock("@/hooks/useWishlist", () => ({
  useWishlist: () => ({
    isInWishlist: vi.fn(() => false),
    toggleWishlist: vi.fn(),
    isAdding: false,
    isRemoving: false,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: localeState.locale,
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "106" }),
  usePathname: () => "/products/106",
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/toast", () => ({
  notifyToast: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    ...props
  }: Record<string, unknown>) => (
    <img {...props} alt={String(props.alt ?? "")} />
  ),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    apiPublic: {
      get: vi.fn(),
    },
  };
});

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

function buildProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 106,
    name: "A Brief History of Time",
    shortDescription:
      "Cuốn sách khoa học nổi tiếng dành cho showcase flash sale.",
    description:
      "Một hành trình ngắn gọn qua vũ trụ, thời gian và các câu hỏi lớn của vật lý hiện đại.",
    author: "Stephen Hawking",
    publisher: "Bantam",
    price: 129000,
    currentPrice: 75233,
    discountPercent: 42,
    stockQuantity: 32,
    inStock: true,
    imageUrl: "/images/books/history-of-time.jpg",
    images: ["/images/books/history-of-time.jpg"],
    category: {
      id: 8,
      name: "Khoa Học Tự Nhiên",
    },
    avgRating: 4.5,
    reviewCount: 120,
    ...overrides,
  };
}

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localeState.locale = "vi";
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the localized flash-sale countdown card when the product has an active flash sale", async () => {
    vi.mocked(apiPublic.get).mockImplementation(async (url: string) => {
      if (url === "/products/106") {
        return {
          data: buildProduct({
            activeFlashSale: {
              id: 700,
              endTime: "2099-04-13T12:00:00.000Z",
              remainingStock: 7,
              stockLimit: 12,
              soldCount: 5,
              maxPerUser: 2,
            },
          }),
        };
      }

      if (url.startsWith("/products/106/related")) {
        return { data: [] };
      }

      if (url.startsWith("/reviews/product/106")) {
        return {
          data: {
            content: [],
            page: 0,
            size: 5,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }

      return { data: [] };
    });

    const { rerender } = renderWithQueryClient(<ProductDetailPage />);

    expect(
      await screen.findByTestId("flash-sale-countdown-card"),
    ).toBeInTheDocument();
    expect(screen.getByText("Flash sale đang diễn ra")).toBeInTheDocument();
    expect(screen.getByText("Giá ưu đãi chỉ còn trong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sau khi hết thời gian này, giá sẽ trở về mức thông thường.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Còn 7 suất giá tốt trong đợt sale này"),
    ).toBeInTheDocument();
    expect(screen.getByText("Đã bán 5")).toBeInTheDocument();
    expect(screen.getByText("Tổng 12 suất")).toBeInTheDocument();

    localeState.locale = "en";
    rerender(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <ProductDetailPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Flash sale is live")).toBeInTheDocument();
    expect(screen.getByText("Special price ends in")).toBeInTheDocument();
    expect(
      screen.getByText(
        "When this timer ends, the price will return to the standard amount.",
      ),
    ).toBeInTheDocument();
  });

  it("refetches the product detail and hides the countdown after the flash sale expires", async () => {
    let productRequests = 0;
    const endTime = new Date(Date.now() + 1100).toISOString();

    vi.mocked(apiPublic.get).mockImplementation(async (url: string) => {
      if (url === "/products/106") {
        productRequests += 1;

        if (productRequests === 1) {
          return {
            data: buildProduct({
              activeFlashSale: {
                id: 700,
                endTime,
                remainingStock: 5,
                maxPerUser: 2,
              },
            }),
          };
        }

        return {
          data: buildProduct({
            currentPrice: 129000,
            discountPercent: 0,
            activeFlashSale: undefined,
          }),
        };
      }

      if (url.startsWith("/products/106/related")) {
        return { data: [] };
      }

      if (url.startsWith("/reviews/product/106")) {
        return {
          data: {
            content: [],
            page: 0,
            size: 5,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }

      return { data: [] };
    });

    renderWithQueryClient(<ProductDetailPage />);

    expect(
      await screen.findByTestId("flash-sale-countdown-card"),
    ).toBeInTheDocument();
    expect(productRequests).toBe(1);

    await waitFor(
      () => {
        expect(productRequests).toBe(2);
      },
      { timeout: 4000 },
    );

    await waitFor(
      () => {
        expect(
          screen.queryByTestId("flash-sale-countdown-card"),
        ).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    expect(screen.getByText("129.000 ₫")).toBeInTheDocument();
  });
});
