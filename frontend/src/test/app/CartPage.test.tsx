import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CartPage from "@/app/cart/page";

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

vi.mock("@/lib/store", async () => {
  const actual = await vi.importActual<typeof import("@/lib/store")>("@/lib/store");
  return {
    ...actual,
    useAuthStore: () => ({
      isAuthenticated: false,
    }),
    useCartStore: () => ({
      items: [],
      totalItems: 0,
      total: 0,
      setCart: vi.fn(),
      clearCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
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

describe("CartPage", () => {
  beforeEach(() => {
    localeState.locale = "en";
  });

  it("renders the English login-required cart copy", () => {
    renderWithQueryClient(<CartPage />);

    expect(screen.getByRole("heading", { name: "Your Cart Is Empty" })).toBeInTheDocument();
    expect(screen.getByText("Please sign in to view your cart")).toBeInTheDocument();
  });
});
