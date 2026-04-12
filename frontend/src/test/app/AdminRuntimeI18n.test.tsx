import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminDashboard from "@/app/admin/page";
import AdminProductsPage from "@/app/admin/products/page";
import AdminOrdersPage from "@/app/admin/orders/page";
import AdminOrderDetailPage from "@/app/admin/orders/[id]/page";
import AdminUsersPage from "@/app/admin/users/page";
import { api } from "@/lib/api";

let currentLocale: "vi" | "en" = "vi";

beforeEach(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Recharts depends on ResizeObserver in jsdom.
  Object.assign(globalThis, { ResizeObserver: ResizeObserverMock });
});

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

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    isAdmin: true,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAdmin: true,
  }),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    user: { id: 1, fullName: "Admin User", email: "admin@example.com" },
    isAuthenticated: true,
  }),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ push: pushMock, replace: pushMock, refresh: vi.fn() }),
    useParams: () => ({ id: "123" }),
  };
});

vi.mock("@/components/ui/toaster", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const utils = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { ...utils, queryClient };
}

describe("Admin runtime i18n", () => {
  beforeEach(() => {
    currentLocale = "vi";
    pushMock.mockClear();

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === "/admin/dashboard") {
        return {
          data: {
            totalUsers: 24,
            totalProducts: 192,
            totalOrders: 48,
            pendingOrders: 6,
            completedOrders: 32,
            totalRevenue: 123456789,
            lowStockProducts: 3,
            newOrdersThisMonth: 8,
            revenueThisMonth: 4567890,
          },
        };
      }

      if (url.startsWith("/products?")) {
        return {
          data: {
            content: [
              {
                id: 1,
                name: "Clean Code",
                author: "Robert C. Martin",
                imageUrl: null,
                category: { name: "Software" },
                currentPrice: 120000,
                price: 150000,
                discountPercent: 20,
                stockQuantity: 8,
                soldCount: 12,
              },
            ],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10,
          },
        };
      }

      if (url.startsWith("/admin/orders?")) {
        return {
          data: {
            content: [
              {
                id: 1,
                orderNumber: "ORD-001",
                user: { id: 1, email: "user@example.com", fullName: "Test User" },
                totalAmount: 450000,
                status: "PENDING",
                paymentMethod: "COD",
                paymentStatus: "PENDING",
                orderItems: [{ id: 1, productId: 1, productName: "Clean Code", quantity: 1, price: 450000 }],
                shippingAddress: "123 Street",
                createdAt: "2026-04-12T00:00:00Z",
              },
            ],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10,
          },
        };
      }

      if (url === "/admin/orders/123") {
        return {
          data: {
            id: 123,
            orderNumber: "ORD-123",
            user: { id: 1, email: "user@example.com", fullName: "Test User", phone: "0900000000" },
            totalAmount: 450000,
            subtotal: 400000,
            shippingFee: 30000,
            taxAmount: 20000,
            discountAmount: 0,
            status: "PENDING",
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            orderItems: [{ id: 1, productId: 1, productName: "Clean Code", quantity: 1, price: 450000 }],
            shippingAddress: "123 Street",
            shippingPhone: "0900000000",
            shippingReceiverName: "Test User",
            createdAt: "2026-04-12T00:00:00Z",
          },
        };
      }

      if (url.startsWith("/admin/users/search") || url.startsWith("/admin/users?") || url === "/admin/users") {
        return {
          data: {
            content: [
              {
                id: 1,
                email: "customer@example.com",
                firstName: "Customer",
                lastName: "User",
                fullName: "Customer User",
                roles: ["CUSTOMER"],
                enabled: true,
                createdAt: "2026-04-12T00:00:00Z",
              },
            ],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10,
          },
        };
      }

      return { data: [] };
    });
  });

  it("switches dashboard copy between vi and en", async () => {
    const { rerender } = renderWithQueryClient(<AdminDashboard />);

    expect(await screen.findByText("Bảng điều khiển quản trị")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Làm mới" })).toBeInTheDocument();

    currentLocale = "en";
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdminDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("switches product management copy between vi and en", async () => {
    const { rerender } = renderWithQueryClient(<AdminProductsPage />);

    expect(await screen.findByText("Quản lý sản phẩm")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tìm kiếm sản phẩm...")).toBeInTheDocument();

    currentLocale = "en";
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdminProductsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Product management")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument();
  });

  it("switches order list copy between vi and en", async () => {
    const { rerender } = renderWithQueryClient(<AdminOrdersPage />);

    expect(await screen.findByRole("heading", { name: "Quản lý đơn hàng" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tìm theo mã đơn, email...")).toBeInTheDocument();

    currentLocale = "en";
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdminOrdersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Order management" })).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("Search by order code or email...")).toBeInTheDocument();
  });

  it("switches order detail copy between vi and en", async () => {
    const { rerender } = renderWithQueryClient(<AdminOrderDetailPage />);

    expect(await screen.findByRole("heading", { name: /ORD-123/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Sản phẩm trong đơn/ })).toBeInTheDocument();

    currentLocale = "en";
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdminOrderDetailPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Items in order/ })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("switches user management copy between vi and en", async () => {
    const { rerender } = renderWithQueryClient(<AdminUsersPage />);

    expect(await screen.findByRole("heading", { name: "Quản lý người dùng" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tìm kiếm theo tên, email...")).toBeInTheDocument();

    currentLocale = "en";
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdminUsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "User management" })).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("Search by name or email...")).toBeInTheDocument();
  });
});
