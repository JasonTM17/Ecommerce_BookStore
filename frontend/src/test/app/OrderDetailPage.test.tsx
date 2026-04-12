import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderDetailPage from "@/app/orders/[id]/page";
import { api } from "@/lib/api";

const replaceMock = vi.fn();

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "101" }),
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    isLoading: false,
  }),
}));

vi.mock("@/lib/store", async () => {
  const actual = await vi.importActual<typeof import("@/lib/store")>("@/lib/store");
  return {
    ...actual,
    useAuthStore: () => ({
      isAuthenticated: true,
    }),
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

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("OrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        id: 101,
        orderNumber: "ORD-101",
        orderStatus: "PROCESSING",
        orderStatusDisplayName: "Processing",
        paymentStatus: "PAID",
        paymentStatusDisplayName: "Paid",
        orderItems: [
          {
            id: 1,
            quantity: 2,
            price: 150000,
            subtotal: 300000,
            product: {
              id: 5,
              name: "Clean Architecture",
              currentPrice: 150000,
              price: 150000,
              stockQuantity: 10,
              inStock: true,
              imageUrl: "",
            },
          },
        ],
        shippingAddress: "123 Main Street",
        shippingPhone: "0901234567",
        shippingReceiverName: "Test User",
        shippingMethod: "Express",
        shippingFee: 20000,
        subtotal: 300000,
        taxAmount: 0,
        discountAmount: 10000,
        totalAmount: 310000,
        paymentMethod: "COD",
        notes: "Please call before delivery",
        createdAt: "2026-04-12T10:00:00.000Z",
        deliveredAt: undefined,
      },
    });
  });

  it("renders the authenticated order detail view", async () => {
    renderWithQueryClient(<OrderDetailPage />);

    expect(await screen.findByText("ORD-101")).toBeInTheDocument();
    expect(screen.getByText("Clean Architecture")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thông tin giao hàng" })).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
