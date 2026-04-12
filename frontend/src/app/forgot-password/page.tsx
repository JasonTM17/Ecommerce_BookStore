"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { buildLoginRedirect } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle, Lock, Mail } from "lucide-react";

type Locale = "vi" | "en";

function resolveRedirectTarget(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }

  return raw;
}

const copy: Record<
  Locale,
  {
    backHome: string;
    brand: string;
    requestTitle: string;
    requestDescription: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendCode: string;
    sending: string;
    remember: string;
    loginNow: string;
    resetTitle: string;
    resetDescription: (email: string) => string;
    tokenLabel: string;
    tokenPlaceholder: string;
    newPasswordLabel: string;
    newPasswordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    submitReset: string;
    resetting: string;
    resendCode: string;
    requestSuccess: string;
    resetSuccess: string;
    genericError: string;
    tokenRequired: string;
    tokenExpired: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordLength: string;
    passwordMismatch: string;
  }
> = {
  vi: {
    backHome: "Quay lại trang chủ",
    brand: "BookStore",
    requestTitle: "Quên Mật Khẩu?",
    requestDescription: "Nhập địa chỉ email của bạn để nhận mã đặt lại mật khẩu",
    emailLabel: "Email",
    emailPlaceholder: "Nhập email của bạn",
    sendCode: "Gửi Mã Xác Thực",
    sending: "Đang gửi...",
    remember: "Nhớ mật khẩu?",
    loginNow: "Đăng nhập ngay",
    resetTitle: "Đặt Lại Mật Khẩu",
    resetDescription: (email) => `Mã xác thực đã được gửi đến email ${email}`,
    tokenLabel: "Mã xác thực",
    tokenPlaceholder: "Nhập mã từ email",
    newPasswordLabel: "Mật khẩu mới",
    newPasswordPlaceholder: "Nhập mật khẩu mới",
    confirmPasswordLabel: "Xác nhận mật khẩu",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
    submitReset: "Đặt Lại Mật Khẩu",
    resetting: "Đang đặt lại...",
    resendCode: "Gửi lại mã xác thực",
    requestSuccess: "Đã gửi email đặt lại mật khẩu!",
    resetSuccess: "Đặt lại mật khẩu thành công!",
    genericError: "Có lỗi xảy ra",
    tokenRequired: "Mã xác thực không được để trống",
    tokenExpired: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
    emailRequired: "Email không được để trống",
    emailInvalid: "Email không hợp lệ",
    passwordRequired: "Mật khẩu mới không được để trống",
    passwordLength: "Mật khẩu phải có ít nhất 6 ký tự",
    passwordMismatch: "Mật khẩu xác nhận không khớp",
  },
  en: {
    backHome: "Back to home",
    brand: "BookStore",
    requestTitle: "Forgot Password?",
    requestDescription: "Enter your email address to receive a password reset code",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    sendCode: "Send Verification Code",
    sending: "Sending...",
    remember: "Remember your password?",
    loginNow: "Sign in now",
    resetTitle: "Reset Password",
    resetDescription: (email) => `The verification code has been sent to ${email}`,
    tokenLabel: "Verification code",
    tokenPlaceholder: "Enter the code from email",
    newPasswordLabel: "New password",
    newPasswordPlaceholder: "Enter your new password",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your new password",
    submitReset: "Reset Password",
    resetting: "Resetting...",
    resendCode: "Resend verification code",
    requestSuccess: "Password reset email sent!",
    resetSuccess: "Password reset successfully!",
    genericError: "Something went wrong",
    tokenRequired: "Verification code is required",
    tokenExpired: "The verification code has expired. Please request a new one.",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email",
    passwordRequired: "New password is required",
    passwordLength: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
  },
};

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pageCopy = copy[locale];
  const redirectTarget = resolveRedirectTarget(searchParams.get("redirect"));
  const loginHref = useMemo(() => buildLoginRedirect(redirectTarget), [redirectTarget]);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: pageCopy.emailRequired });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: pageCopy.emailInvalid });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      toast.success(pageCopy.requestSuccess);
      setStep("reset");
    } catch (error: any) {
      if (error.response?.data?.message?.includes("không tồn tại")) {
        setErrors({
          email:
            locale === "vi"
              ? "Email không tồn tại trong hệ thống"
              : "Email does not exist in the system",
        });
      } else {
        toast.error(error.response?.data?.message || pageCopy.genericError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!token) {
      newErrors.token = pageCopy.tokenRequired;
    }

    if (!newPassword) {
      newErrors.newPassword = pageCopy.passwordRequired;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = pageCopy.passwordLength;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = pageCopy.passwordMismatch;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success(pageCopy.resetSuccess);
      setTimeout(() => {
        window.location.href = loginHref;
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.message?.includes("hết hạn")) {
        setErrors({ token: pageCopy.tokenExpired });
      } else {
        toast.error(error.response?.data?.message || pageCopy.genericError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {pageCopy.backHome}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{pageCopy.brand}</h1>
        </div>

        {step === "request" ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{pageCopy.requestTitle}</CardTitle>
              <CardDescription>{pageCopy.requestDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {pageCopy.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      placeholder={pageCopy.emailPlaceholder}
                      className={`w-full h-10 rounded-md border bg-white pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200"}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 flex items-center text-sm text-red-500">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-10 w-full items-center justify-center rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isLoading ? pageCopy.sending : pageCopy.sendCode}
                </button>

                <div className="text-center text-sm text-gray-500">
                  {pageCopy.remember}{" "}
                  <Link href={loginHref} className="text-blue-600 hover:underline">
                    {pageCopy.loginNow}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{pageCopy.resetTitle}</CardTitle>
              <CardDescription>{pageCopy.resetDescription(email)}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="token" className="text-sm font-medium text-gray-700">
                    {pageCopy.tokenLabel}
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isLoading}
                    placeholder={pageCopy.tokenPlaceholder}
                    className={`w-full h-10 rounded-md border bg-white px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${errors.token ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200"}`}
                  />
                  {errors.token && (
                    <p className="mt-1 flex items-center text-sm text-red-500">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {errors.token}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    {pageCopy.newPasswordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder={pageCopy.newPasswordPlaceholder}
                      className={`w-full h-10 rounded-md border bg-white pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${errors.newPassword ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200"}`}
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 flex items-center text-sm text-red-500">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {pageCopy.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder={pageCopy.confirmPasswordPlaceholder}
                      className={`w-full h-10 rounded-md border bg-white pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200"}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 flex items-center text-sm text-red-500">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-10 w-full items-center justify-center rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isLoading ? pageCopy.resetting : pageCopy.submitReset}
                </button>

                <div className="text-center text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    className="text-blue-600 hover:underline"
                  >
                    {pageCopy.resendCode}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
