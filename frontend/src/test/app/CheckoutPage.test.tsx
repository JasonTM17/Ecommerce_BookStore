import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CheckoutPage from "@/app/checkout/page";
import { api } from "@/lib/api";

const testState = vi.hoisted(() => ({
  localeState: { locale: "en" as "vi" | "en" },
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  clearCartMock: vi.fn(),
  setCartMock: vi.fn(),
  toastErrorMock: vi.fn(),
  authState: {
    user: { fullName: "Test User", phoneNumber: "0901234567", email: "test@example.com" },
    isAuthenticated: true,
  },
  cartState: {
    items: [] as Array<{
      id: number;
      quantity: number;
      subtotal: number;
      product: { id: number; name: string; imageUrl?: string; currentPrice: number };
    }>,
  },
  addressState: {
    addresses: [] as Array<{
      id: number;
      receiverName: string;
      phoneNumber: string;
      province: string;
      district: string;
      ward: string;
      streetAddress: string;
      fullAddress: string;
      isDefault: boolean;
      addressType: string;
    }>,
  },
}));

vi.mock("@/components/layout/header", () => ({ Header: () => <div>Header</div> }));
vi.mock("@/components/layout/footer", () => ({ Footer: () => <div>Footer</div> }));

vi.mock("@/components/coupon", () => ({
  CouponInput: () => <div>CouponInput</div>,
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({ locale: testState.localeState.locale, isLoading: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: testState.replaceMock, push: testState.pushMock }),
}));

vi.mock("sonner", () => ({
  toast: { error: testState.toastErrorMock },
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/lib/store", async () => {
  const actual = await vi.importActual<typeof import("@/lib/store")>("@/lib/store");
  return {
    ...actual,
    useAuthStore: () => ({
      user: testState.authState.user,
      isAuthenticated: testState.authState.isAuthenticated,
    }),
    useCartStore: () => ({
      items: testState.cartState.items,
      clearCart: testState.clearCartMock,
      setCart: testState.setCartMock,
    }),
  };
});

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.localeState.locale = "en";
    testState.authState.isAuthenticated = true;
    testState.cartState.items = [];
    testState.addressState.addresses = [];

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === "/addresses") {
        return { data: testState.addressState.addresses };
      }

      if (url === "/cart") {
        return {
          data: {
            id: 1,
            items: testState.cartState.items,
            totalItems: testState.cartState.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: testState.cartState.items.reduce((sum, item) => sum + item.subtotal, 0),
            total: testState.cartState.items.reduce((sum, item) => sum + item.subtotal, 0),
          },
        };
      }

      throw new Error(`Unhandled GET ${url}`);
    });

    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: 88,
        orderNumber: "ORD-TEST-001",
        totalAmount: 145000,
      },
    });
  });

  it("renders the English empty-cart checkout copy", async () => {
    renderWithQueryClient(<CheckoutPage />);

    expect(await screen.findByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByText("Please add items to your cart before placing an order.")).toBeInTheDocument();
  });

  it("submits a checkout order with a new address", async () => {
    testState.cartState.items = [
      {
        id: 1,
        quantity: 2,
        subtotal: 240000,
        product: { id: 11, name: "Clean Code", currentPrice: 120000 },
      },
    ];

    renderWithQueryClient(<CheckoutPage />);

    fireEvent.change(await screen.findByLabelText("Receiver full name *"), {
      target: { value: "Alice Nguyen" },
    });
    fireEvent.change(screen.getByLabelText("Phone number *"), {
      target: { value: "0987654321" },
    });
    fireEvent.change(screen.getByLabelText("Province / City *"), {
      target: { value: "Ho Chi Minh City" },
    });
    fireEvent.change(screen.getByLabelText("District *"), {
      target: { value: "District 1" },
    });
    fireEvent.change(screen.getByLabelText("Ward *"), {
      target: { value: "Ben Nghe" },
    });
    fireEvent.change(screen.getByLabelText("Street address *"), {
      target: { value: "123 Nguyen Hue" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm information" }));
    fireEvent.click(await screen.findByRole("button", { name: "Place order" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/orders", expect.objectContaining({
        shippingAddress: "123 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City",
        shippingPhone: "0987654321",
        shippingReceiverName: "Alice Nguyen",
      }));
    });

    expect(await screen.findByText("Order placed successfully!")).toBeInTheDocument();
    expect(testState.clearCartMock).toHaveBeenCalled();
  });

  it("submits a checkout order with a saved address", async () => {
    testState.cartState.items = [
      {
        id: 1,
        quantity: 1,
        subtotal: 99000,
        product: { id: 22, name: "The Pragmatic Programmer", currentPrice: 99000 },
      },
    ];
    testState.addressState.addresses = [
      {
        id: 7,
        receiverName: "Saved User",
        phoneNumber: "0911222333",
        province: "Ha Noi",
        district: "Ba Dinh",
        ward: "Kim Ma",
        streetAddress: "45 Lieu Giai",
        fullAddress: "45 Lieu Giai, Kim Ma, Ba Dinh, Ha Noi",
        isDefault: true,
        addressType: "HOME",
      },
    ];

    renderWithQueryClient(<CheckoutPage />);

    fireEvent.click(await screen.findByRole("radio", { name: /saved user/i }));
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm information" }));
    fireEvent.click(await screen.findByRole("button", { name: "Place order" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/orders", expect.objectContaining({
        shippingAddress: "45 Lieu Giai, Kim Ma, Ba Dinh, Ha Noi",
        shippingPhone: "0911222333",
        shippingReceiverName: "Saved User",
      }));
    });
  });

  it("shows the backend error message when placing an order fails", async () => {
    testState.cartState.items = [
      {
        id: 1,
        quantity: 1,
        subtotal: 120000,
        product: { id: 33, name: "Refactoring", currentPrice: 120000 },
      },
    ];
    vi.mocked(api.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          message: "Insufficient flash sale stock",
        },
      },
    });

    renderWithQueryClient(<CheckoutPage />);

    fireEvent.change(await screen.findByLabelText("Receiver full name *"), {
      target: { value: "Alice Nguyen" },
    });
    fireEvent.change(screen.getByLabelText("Phone number *"), {
      target: { value: "0987654321" },
    });
    fireEvent.change(screen.getByLabelText("Province / City *"), {
      target: { value: "Ho Chi Minh City" },
    });
    fireEvent.change(screen.getByLabelText("District *"), {
      target: { value: "District 1" },
    });
    fireEvent.change(screen.getByLabelText("Ward *"), {
      target: { value: "Ben Nghe" },
    });
    fireEvent.change(screen.getByLabelText("Street address *"), {
      target: { value: "123 Nguyen Hue" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm information" }));
    fireEvent.click(await screen.findByRole("button", { name: "Place order" }));

    expect(await screen.findByText("Insufficient flash sale stock")).toBeInTheDocument();
    expect(testState.toastErrorMock).toHaveBeenCalledWith("Insufficient flash sale stock");
  });
});
