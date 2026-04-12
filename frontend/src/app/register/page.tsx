"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthTokens } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Eye, EyeOff, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const router = useRouter();
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

  const registerMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast.success("Đăng ký thành công! Chào mừng bạn đến với BookStore!");
      router.push("/");
    },
    onError: () => {
      toast.error("Email đã được sử dụng hoặc thông tin không hợp lệ");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
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
      {/* Left - Banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <BookOpen className="h-24 w-24 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Tham Gia BookStore</h2>
          <p className="text-white/80 text-lg mb-8">
            Đăng ký ngay hôm nay để nhận ưu đãi 10% cho đơn hàng đầu tiên và khám phá thế giới sách phong phú.
          </p>
          <div className="space-y-3 text-left max-w-sm mx-auto">
            {[
              "Miễn phí vận chuyển cho đơn từ 200K",
              "Đánh giá và nhận xét sản phẩm",
              "Theo dõi đơn hàng dễ dàng",
              "Nhận nhiều ưu đãi hấp dẫn",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="font-bold text-xl text-primary">BookStore</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Tạo Tài Khoản</h1>
            <p className="text-gray-600 mt-2">
              Đăng ký để bắt đầu mua sắm và khám phá thế giới sách
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  Họ *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  placeholder="Nguyễn"
                  required
                  disabled={registerMutation.isPending}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Tên *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  placeholder="Văn A"
                  required
                  disabled={registerMutation.isPending}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                disabled={registerMutation.isPending}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateForm("phoneNumber", e.target.value)}
                placeholder="0901234567"
                disabled={registerMutation.isPending}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder="Ít nhất 8 ký tự"
                  required
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu *
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                autoComplete="new-password"
                disabled={registerMutation.isPending}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}

            <div className="text-sm text-gray-500">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Điều khoản sử dụng
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Chính sách bảo mật
              </Link>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <span>Đăng Ký</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
