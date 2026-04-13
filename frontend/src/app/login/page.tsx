"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";

type Locale = "vi" | "en";

function resolveRedirectTarget(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }

  return raw;
}

function buildRegisterHref(target: string | null) {
  return target ? `/register?redirect=${encodeURIComponent(target)}` : "/register";
}

function buildForgotPasswordHref(target: string | null) {
  return target ? `/forgot-password?redirect=${encodeURIComponent(target)}` : "/forgot-password";
}

const copy: Record<
  Locale,
  {
    loading: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    submit: string;
    submitting: string;
    noAccount: string;
    signUp: string;
    bannerTitle: string;
    bannerSubtitle: string;
    genericError: string;
    emailPlaceholder: string;
    showPassword: string;
    hidePassword: string;
  }
> = {
  vi: {
    loading: "Đang tải...",
    title: "Đăng nhập",
    subtitle: "Chào mừng bạn quay trở lại!",
    emailLabel: "Email",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    forgotPassword: "Quên mật khẩu?",
    submit: "Đăng nhập",
    submitting: "Đang đăng nhập...",
    noAccount: "Chưa có tài khoản?",
    signUp: "Đăng ký ngay",
    bannerTitle: "Khám phá thế giới sách",
    bannerSubtitle: "Hàng ngàn đầu sách hay đang chờ bạn khám phá.",
    genericError: "Email hoặc mật khẩu không chính xác",
    emailPlaceholder: "your.email@example.com",
    showPassword: "Hiện mật khẩu",
    hidePassword: "Ẩn mật khẩu",
  },
  en: {
    loading: "Loading...",
    title: "Sign In",
    subtitle: "Welcome back!",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    submit: "Sign In",
    submitting: "Signing in...",
    noAccount: "No account yet?",
    signUp: "Sign up now",
    bannerTitle: "Discover the World of Books",
    bannerSubtitle: "Thousands of great books are waiting for you.",
    genericError: "Email or password is incorrect",
    emailPlaceholder: "your.email@example.com",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
};

function getRedirectNotice(locale: Locale, redirectTarget: string | null) {
  if (!redirectTarget) {
    return null;
  }

  const notices: Record<Locale, Record<string, string>> = {
    vi: {
      "/products": "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
      product: "Đăng nhập để tiếp tục với cuốn sách bạn vừa chọn.",
      "/orders": "Đăng nhập để xem đơn hàng và trạng thái giao hàng của bạn.",
      "/checkout": "Đăng nhập để tiếp tục thanh toán an toàn.",
      "/wishlist": "Đăng nhập để đồng bộ danh sách yêu thích của bạn.",
      default: "Đăng nhập để tiếp tục hành động bạn vừa chọn.",
    },
    en: {
      "/products": "Please sign in to add items to your cart.",
      product: "Sign in to continue with the book you just selected.",
      "/orders": "Sign in to view your orders and shipping status.",
      "/checkout": "Sign in to continue to secure checkout.",
      "/wishlist": "Sign in to sync your wishlist.",
      default: "Sign in to continue with the action you selected.",
    },
  };

  if (redirectTarget === "/products") {
    return notices[locale]["/products"];
  }

  if (redirectTarget.startsWith("/products/")) {
    return notices[locale].product;
  }

  if (redirectTarget === "/orders") {
    return notices[locale]["/orders"];
  }

  if (redirectTarget === "/checkout") {
    return notices[locale]["/checkout"];
  }

  if (redirectTarget === "/wishlist") {
    return notices[locale]["/wishlist"];
  }

  return notices[locale].default;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageCopy = copy[locale];
  const redirectTarget = resolveRedirectTarget(searchParams.get("redirect"));
  const redirectNotice = getRedirectNotice(locale, redirectTarget);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { api, setAuthTokens } = await import("@/lib/api");
      const { useAuthStore } = await import("@/lib/store");

      const response = await api.post("/auth/login", { email, password });
      const data = response.data;

      setAuthTokens(data.accessToken, data.refreshToken);
      useAuthStore.getState().setUser(data.user);

      const isAdmin = data.user?.roles?.includes("ADMIN") || data.user?.roles?.includes("MANAGER");
      const destination = redirectTarget || (isAdmin ? "/admin" : "/");
      router.replace(destination);
      router.refresh();
    } catch (err: any) {
      const message = err.response?.data?.message || pageCopy.genericError;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{pageCopy.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="font-bold text-xl text-blue-600">BookStore</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{pageCopy.title}</h1>
            <p className="text-gray-600 mt-2">{pageCopy.subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {redirectNotice && (
            <div
              data-testid="login-redirect-notice"
              className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
            >
              {redirectNotice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {pageCopy.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={pageCopy.emailPlaceholder}
                required
                disabled={isLoading}
                className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {pageCopy.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={pageCopy.passwordPlaceholder}
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-3 pr-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label={showPassword ? pageCopy.hidePassword : pageCopy.showPassword}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href={buildForgotPasswordHref(redirectTarget)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {pageCopy.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>{pageCopy.submitting}</span>
              ) : (
                <>
                  <span>{pageCopy.submit}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {pageCopy.noAccount}{" "}
              <Link
                href={buildRegisterHref(redirectTarget)}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                {pageCopy.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{pageCopy.bannerTitle}</h2>
          <p className="text-white/80 text-lg mb-8">{pageCopy.bannerSubtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">{copy.vi.loading}</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
