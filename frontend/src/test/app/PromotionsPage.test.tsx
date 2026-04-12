import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PromotionsPage from "@/app/promotions/page";
import { couponApi } from "@/lib/coupon";

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
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

describe("PromotionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByRole("heading", { name: /available coupons/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to cart/i })).toHaveAttribute("href", "/cart");
  });
});
