import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrdersPage from "@/app/orders/page";
import { api } from "@/lib/api";

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
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/orders",
}));

vi.mock("@/lib/store", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/store")>("@/lib/store");
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
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("OrdersPage", () => {
  beforeEach(() => {
    localeState.locale = "en";
    vi.mocked(api.get).mockResolvedValue({
      data: {
        content: [],
      },
    });
  });

  it("renders the English empty-state copy", async () => {
    renderWithQueryClient(<OrdersPage />);

    expect(
      await screen.findByRole("heading", { name: "My Orders" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("No Orders Yet")).toBeInTheDocument();
  });
});
