"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api, setAuthTokens } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useLanguage } from "@/components/providers/language-provider";

type Locale = "vi" | "en";

function resolveRedirectTarget(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }

  return raw;
}

function buildLoginHref(target: string | null) {
  return target ? `/login?redirect=${encodeURIComponent(target)}` : "/login";
}

const copy: Record<
  Locale,
  {
    bannerTitle: string;
    bannerSubtitle: string;
    benefits: string[];
    title: string;
    subtitle: string;
    firstNameLabel: string;
    lastNameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    termsPrefix: string;
    termsLink: string;
    privacyLink: string;
    submit: string;
    submitting: string;
    hasAccount: string;
    loginNow: string;
    successToast: string;
    failureToast: string;
    passwordMismatch: string;
    passwordTooShort: string;
    showPassword: string;
    hidePassword: string;
  }
> = {
  vi: {
    bannerTitle: "Tham Gia BookStore",
    bannerSubtitle:
      "Đăng ký ngay hôm nay để nhận ưu đãi 10% cho đơn hàng đầu tiên và khám phá thế giới sách phong phú.",
    benefits: [
      "Miễn phí vận chuyển cho đơn từ 200K",
      "Đánh giá và nhận xét sản phẩm",
      "Theo dõi đơn hàng dễ dàng",
      "Nhận nhiều ưu đãi hấp dẫn",
    ],
    title: "Tạo Tài Khoản",
    subtitle: "Đăng ký để bắt đầu mua sắm và khám phá thế giới sách",
    firstNameLabel: "Họ *",
    lastNameLabel: "Tên *",
    emailLabel: "Email *",
    phoneLabel: "Số điện thoại",
    passwordLabel: "Mật khẩu *",
    confirmPasswordLabel: "Xác nhận mật khẩu *",
    firstNamePlaceholder: "Nguyễn",
    lastNamePlaceholder: "Văn A",
    emailPlaceholder: "your.email@example.com",
    phonePlaceholder: "0901234567",
    passwordPlaceholder: "Ít nhất 8 ký tự",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu",
    termsPrefix: "Bằng cách đăng ký, bạn đồng ý với",
    termsLink: "Điều khoản sử dụng",
    privacyLink: "Chính sách bảo mật",
    submit: "Đăng Ký",
    submitting: "Đang đăng ký...",
    hasAccount: "Đã có tài khoản?",
    loginNow: "Đăng nhập ngay",
    successToast: "Đăng ký thành công! Chào mừng bạn đến với BookStore!",
    failureToast: "Email đã được sử dụng hoặc thông tin không hợp lệ",
    passwordMismatch: "Mật khẩu xác nhận không khớp",
    passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
    showPassword: "Hiện mật khẩu",
    hidePassword: "Ẩn mật khẩu",
  },
  en: {
    bannerTitle: "Join BookStore",
    bannerSubtitle:
      "Sign up today to get 10% off your first order and explore a rich world of books.",
    benefits: [
      "Free shipping on orders over 200K",
      "Review and rate products",
      "Track your orders easily",
      "Enjoy exclusive deals",
    ],
    title: "Create Account",
    subtitle: "Register to start shopping and exploring books",
    firstNameLabel: "First name *",
    lastNameLabel: "Last name *",
    emailLabel: "Email *",
    phoneLabel: "Phone number",
    passwordLabel: "Password *",
    confirmPasswordLabel: "Confirm password *",
    firstNamePlaceholder: "Nguyen",
    lastNamePlaceholder: "Van A",
    emailPlaceholder: "your.email@example.com",
    phonePlaceholder: "0901234567",
    passwordPlaceholder: "At least 8 characters",
    confirmPasswordPlaceholder: "Re-enter your password",
    termsPrefix: "By registering, you agree to the",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    submit: "Sign Up",
    submitting: "Signing up...",
    hasAccount: "Already have an account?",
    loginNow: "Sign in now",
    successToast: "Registration successful! Welcome to BookStore!",
    failureToast: "The email is already in use or the information is invalid",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 8 characters",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const redirectTarget = resolveRedirectTarget(searchParams.get("redirect"));
  const pageCopy = copy[locale];
  const loginHref = useMemo(() => buildLoginHref(redirectTarget), [redirectTarget]);

  const registerMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast.success(pageCopy.successToast);
      router.push(redirectTarget || "/");
    },
    onError: () => {
      toast.error(pageCopy.failureToast);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (formData.password !== formData.confirmPassword) {
      setPasswordError(pageCopy.passwordMismatch);
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError(pageCopy.passwordTooShort);
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
    });
  };

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === "password" || field === "confirmPassword") {
      setPasswordError("");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-12 lg:flex">
        <div className="max-w-md text-center text-white">
          <BookOpen className="mx-auto mb-6 h-24 w-24 opacity-80" />
          <h2 className="mb-4 text-3xl font-bold">{pageCopy.bannerTitle}</h2>
          <p className="mb-8 text-lg text-white/80">{pageCopy.bannerSubtitle}</p>
          <div className="mx-auto max-w-sm space-y-3 text-left">
            {pageCopy.benefits.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-yellow-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-white">B</span>
              </div>
              <span className="text-xl font-bold text-primary">BookStore</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{pageCopy.title}</h1>
            <p className="mt-2 text-gray-600">{pageCopy.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  {pageCopy.firstNameLabel}
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  placeholder={pageCopy.firstNamePlaceholder}
                  required
                  disabled={registerMutation.isPending}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  {pageCopy.lastNameLabel}
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  placeholder={pageCopy.lastNamePlaceholder}
                  required
                  disabled={registerMutation.isPending}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                {pageCopy.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder={pageCopy.emailPlaceholder}
                required
                autoComplete="email"
                disabled={registerMutation.isPending}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                {pageCopy.phoneLabel}
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateForm("phoneNumber", e.target.value)}
                placeholder={pageCopy.phonePlaceholder}
                disabled={registerMutation.isPending}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                {pageCopy.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder={pageCopy.passwordPlaceholder}
                  required
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? pageCopy.hidePassword : pageCopy.showPassword}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                {pageCopy.confirmPasswordLabel}
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                placeholder={pageCopy.confirmPasswordPlaceholder}
                required
                autoComplete="new-password"
                disabled={registerMutation.isPending}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

            <div className="text-sm text-gray-500">
              {pageCopy.termsPrefix}{" "}
              <Link href="/terms" className="text-red-600 hover:underline">
                {pageCopy.termsLink}
              </Link>{" "}
              {locale === "vi" ? "và" : "and"}{" "}
              <Link href="/privacy" className="text-red-600 hover:underline">
                {pageCopy.privacyLink}
              </Link>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
            >
              {registerMutation.isPending ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{pageCopy.submitting}</span>
                </>
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
              {pageCopy.hasAccount}{" "}
              <Link href={loginHref} className="font-semibold text-primary hover:underline">
                {pageCopy.loginNow}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
