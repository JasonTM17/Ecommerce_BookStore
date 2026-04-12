import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FlashSalePage from "@/app/flash-sale/page";
import { flashSaleApi } from "@/lib/flashsale";

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/flashsale/FlashSaleCard", () => ({
  FlashSaleCard: ({ sale }: { sale: { product: { name: string } } }) => <div>{sale.product.name}</div>,
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

describe("FlashSalePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(flashSaleApi, "getActiveFlashSales").mockResolvedValue([
      {
        id: 1,
        product: {
          id: 10,
          name: "Active Deal",
          author: "Author A",
          imageUrl: "",
          price: 200000,
          avgRating: 4.5,
          reviewCount: 8,
        },
        originalPrice: 200000,
        salePrice: 150000,
        discountPercent: 25,
        startTime: "2026-04-12T10:00:00.000Z",
        endTime: "2026-04-13T10:00:00.000Z",
        stockLimit: 20,
        soldCount: 5,
        remainingStock: 15,
        isActive: true,
        isStarted: true,
        isEnded: false,
        progress: 25,
      },
    ]);
    vi.spyOn(flashSaleApi, "getUpcomingFlashSales").mockResolvedValue([
      {
        id: 2,
        product: {
          id: 11,
          name: "Upcoming Deal",
          author: "Author B",
          imageUrl: "",
          price: 300000,
          avgRating: 4.8,
          reviewCount: 12,
        },
        originalPrice: 300000,
        salePrice: 220000,
        discountPercent: 27,
        startTime: "2026-04-14T10:00:00.000Z",
        endTime: "2026-04-15T10:00:00.000Z",
        stockLimit: 10,
        soldCount: 0,
        remainingStock: 10,
        isActive: false,
        isStarted: false,
        isEnded: false,
        progress: 0,
      },
    ]);
  });

  it("renders active and upcoming flash sale sections", async () => {
    renderWithQueryClient(<FlashSalePage />);

    expect(await screen.findByText("Active Deal")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Deal")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /chiến dịch đang chạy/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /lịch mở bán tiếp theo/i })).toBeInTheDocument();
  });
});
