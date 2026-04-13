import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let currentLocale: "vi" | "en" = "vi";

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: currentLocale,
    setLocale: vi.fn(),
    t: (key: string) => key,
    isLoading: false,
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
  setAuthTokens: vi.fn(),
}));

import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import ForgotPasswordPage from "@/app/forgot-password/page";

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Auth pages bilingual runtime", () => {
  beforeEach(() => {
    currentLocale = "vi";
    window.history.pushState({}, "", "/login");
  });

  it("renders localized login copy", async () => {
    render(<LoginPage />);

    expect(await screen.findByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByText("Chào mừng bạn quay trở lại!")).toBeInTheDocument();
    expect(screen.queryByText(/admin@bookstore\.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/customer@example\.com/i)).not.toBeInTheDocument();

    cleanup();
    currentLocale = "en";
    window.history.pushState({}, "", "/login");
    render(<LoginPage />);

    expect(await screen.findByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
  });

  it("renders localized register copy", async () => {
    renderWithQueryClient(<RegisterPage />);

    expect(await screen.findByRole("heading", { name: "Tạo Tài Khoản" })).toBeInTheDocument();
    expect(screen.getByText("Đăng ký để bắt đầu mua sắm và khám phá thế giới sách")).toBeInTheDocument();

    cleanup();
    currentLocale = "en";
    window.history.pushState({}, "", "/register");
    renderWithQueryClient(<RegisterPage />);

    expect(await screen.findByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByText("Register to start shopping and exploring books")).toBeInTheDocument();
  });

  it("renders localized forgot-password copy", async () => {
    render(<ForgotPasswordPage />);

    expect(await screen.findByRole("heading", { name: "Quên Mật Khẩu?" })).toBeInTheDocument();
    expect(screen.getByText("Nhập địa chỉ email của bạn để nhận mã đặt lại mật khẩu")).toBeInTheDocument();

    cleanup();
    currentLocale = "en";
    window.history.pushState({}, "", "/forgot-password");
    render(<ForgotPasswordPage />);

    expect(await screen.findByRole("heading", { name: "Forgot Password?" })).toBeInTheDocument();
    expect(screen.getByText("Enter your email address to receive a password reset code")).toBeInTheDocument();
  });
});
