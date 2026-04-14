import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaymentReturnPage from "@/app/payment/return/page";
import { paymentApi } from "@/lib/payment";

const testState = vi.hoisted(() => ({
  locale: "vi" as "vi" | "en",
  pushMock: vi.fn(),
  params: {
    vnp_TxnRef: "TXN123",
    vnp_ResponseCode: "00",
  } as Record<string, string>,
}));

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: testState.locale,
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: testState.pushMock,
  }),
  useSearchParams: () => ({
    entries: () => Object.entries(testState.params)[Symbol.iterator](),
  }),
}));

vi.mock("@/lib/payment", () => ({
  paymentApi: {
    confirmVNPayReturn: vi.fn(),
  },
}));

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("PaymentReturnPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.locale = "vi";
    testState.params = {
      vnp_TxnRef: "TXN123",
      vnp_ResponseCode: "00",
    };
  });

  it("renders the successful VNPay confirmation state", async () => {
    vi.mocked(paymentApi.confirmVNPayReturn).mockResolvedValue({
      success: true,
      orderId: 88,
      orderNumber: "ORD-88",
      paymentStatus: "SUCCESS",
      transactionId: "TXN123",
      amount: 145000,
    });

    renderWithQueryClient(<PaymentReturnPage />);

    expect(
      await screen.findByText("Thanh toán thành công"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Đơn hàng của bạn đã được xác nhận qua VNPay."),
    ).toBeInTheDocument();
    expect(screen.getByText("ORD-88")).toBeInTheDocument();
    expect(screen.getByText("145.000 ₫")).toBeInTheDocument();

    screen.getByRole("button", { name: "Xem chi tiết đơn hàng" }).click();

    await waitFor(() => {
      expect(testState.pushMock).toHaveBeenCalledWith("/orders/88");
    });
  });

  it("renders the failed state when the VNPay callback cannot be confirmed", async () => {
    vi.mocked(paymentApi.confirmVNPayReturn).mockRejectedValue(
      new Error("Invalid signature"),
    );
    testState.locale = "en";

    renderWithQueryClient(<PaymentReturnPage />);

    expect(
      await screen.findByText("Payment not completed"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "You can retry from the order page or switch to cash on delivery if needed.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Invalid signature")).toBeInTheDocument();
  });
});
