import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CheckoutPage from "@/app/checkout/page";

const localeState = { locale: "en" as "vi" | "en" };

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: localeState.locale,
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/store", async () => {
  const actual = await vi.importActual<typeof import("@/lib/store")>("@/lib/store");
  return {
    ...actual,
    useAuthStore: () => ({
      user: { fullName: "Test User", email: "test@example.com" },
      isAuthenticated: true,
    }),
    useCartStore: () => ({
      items: [],
      total: 0,
      clearCart: vi.fn(),
    }),
  };
});

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    localeState.locale = "en";
  });

  it("renders the English empty-cart checkout copy", () => {
    renderWithQueryClient(<CheckoutPage />);

    expect(screen.getByRole("heading", { name: "Your Cart Is Empty" })).toBeInTheDocument();
    expect(screen.getByText("Please add products to your cart first")).toBeInTheDocument();
  });
});
