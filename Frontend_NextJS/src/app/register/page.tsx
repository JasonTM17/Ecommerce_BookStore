"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthTokens } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
              <div>
                <Label htmlFor="firstName">Họ *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  placeholder="Nguyễn"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Tên *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  placeholder="Văn A"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateForm("phoneNumber", e.target.value)}
                placeholder="0901234567"
              />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder="Ít nhất 8 ký tự"
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                autoComplete="new-password"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-500 -mt-2">{passwordError}</p>
            )}

            <div className="text-sm text-gray-500">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Điều khoản sử dụng
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Chính sách bảo mật
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Đang đăng ký..." : "Đăng Ký"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
