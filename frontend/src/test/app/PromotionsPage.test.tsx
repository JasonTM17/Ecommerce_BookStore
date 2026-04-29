import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PromotionsPage from "@/app/promotions/page";
import { couponApi } from "@/lib/coupon";

let currentLocale: "vi" | "en" = "vi";

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: currentLocale,
    setLocale: vi.fn(),
    t: (key: string) => key,
    isLoading: false,
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

describe("PromotionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentLocale = "vi";
    vi.spyOn(couponApi, "getAvailableCoupons").mockResolvedValue([
      {
        id: 1,
        code: "SAVE20",
        description: "Save 20k on qualifying orders",
        type: "FIXED_AMOUNT",
        discountValue: 20000,
        minOrderAmount: 100000,
        maxDiscount: 20000,
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-30T00:00:00.000Z",
        usageLimit: 100,
        usedCount: 10,
        perUserLimit: 1,
        isActive: true,
        isPublic: true,
        isValid: true,
        isExpired: false,
        discountDisplay: "20,000 VND off",
        createdAt: "2026-04-01T00:00:00.000Z",
      },
    ]);
  });

  it("renders available coupons on the promotions landing page", async () => {
    renderWithQueryClient(<PromotionsPage />);

    expect(await screen.findByText("SAVE20")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /coupon đang khả dụng/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /đến giỏ hàng/i })).toHaveAttribute(
      "href",
      "/cart",
    );
    expect(screen.getAllByText(/đơn tối thiểu/i).length).toBeGreaterThan(0);
  });

  it("renders English copy when the locale is English", async () => {
    currentLocale = "en";

    renderWithQueryClient(<PromotionsPage />);

    expect(await screen.findByText("SAVE20")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /available coupons/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to cart/i })).toHaveAttribute(
      "href",
      "/cart",
    );
    expect(screen.getAllByText(/minimum order/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/coupon đang khả dụng/i)).not.toBeInTheDocument();
  });
});
