import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/header";

const logoutMock = vi.fn();

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@example.com", fullName: "Test User" },
    isAuthenticated: true,
    isAdmin: true,
    logout: logoutMock,
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

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    setLocale: vi.fn(),
    t: (key: string) => key,
    isLoading: false,
  }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(" "),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders canonical navigation links without locale prefixes", () => {
    render(<Header />);

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter(Boolean);

    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/",
        "/products",
        "/categories",
        "/about",
        "/products?focus=search",
        "/cart",
      ])
    );
    expect(hrefs.some((href) => href?.includes("/vi/") || href?.includes("/en/"))).toBe(false);
  });

  it("shows authenticated user links with canonical routes", () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: /test user/i }));

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter(Boolean);

    expect(hrefs).toEqual(expect.arrayContaining(["/account", "/orders", "/admin"]));
  });

  it("renders cart badge, search, and menu buttons", () => {
    render(<Header />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });
});
