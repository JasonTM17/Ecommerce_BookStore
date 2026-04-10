import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/header";

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@example.com", fullName: "Test User" },
    isAuthenticated: true,
    isAdmin: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    user: { id: 1, email: "test@example.com", fullName: "Test User" },
    isAuthenticated: true,
    setUser: vi.fn(),
    logout: vi.fn(),
  }),
  useCartStore: () => ({
    totalItems: 3,
    items: [{ id: 1 }, { id: 2 }],
    setCart: vi.fn(),
    clearCart: vi.fn(),
  }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(" "),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo brand text", () => {
    render(<Header />);
    expect(screen.getByText("BookStore")).toBeInTheDocument();
  });

  it("renders cart with item count", () => {
    render(<Header />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
  });

  it("renders user name when authenticated", () => {
    render(<Header />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("renders search button", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("renders menu toggle button", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });
});
