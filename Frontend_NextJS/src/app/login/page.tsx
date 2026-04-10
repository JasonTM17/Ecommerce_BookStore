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
import { Eye, EyeOff, BookOpen, ArrowRight, User, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast.success(`Đăng nhập thành công! Chào mừng trở lại, ${data.user.fullName}!`);
      router.push(data.user.roles?.includes("ADMIN") || data.user.roles?.includes("MANAGER") ? "/admin" : "/");
    },
    onError: () => {
      toast.error("Email hoặc mật khẩu không chính xác");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="font-bold text-xl text-primary">BookStore</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Đăng Nhập</h1>
            <p className="text-gray-600 mt-2">
              Chào mừng bạn quay trở lại! Đăng nhập để tiếp tục mua sắm.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="mt-1"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  className="pr-10"
                  autoComplete="current-password"
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng Nhập"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Tài khoản demo:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-600" /> Admin: <span className="font-mono">admin@bookstore.com</span> / <span className="font-mono">Admin123!</span></p>
              <p className="flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Customer: <span className="font-mono">customer@example.com</span> / <span className="font-mono">Customer123!</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <BookOpen className="h-24 w-24 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Khám Phá Thế Giới Sách</h2>
          <p className="text-white/80 text-lg mb-8">
            Hàng ngàn đầu sách hay đang chờ bạn khám phá. Đăng nhập ngay để bắt đầu hành trình đọc sách của bạn.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-white/70">Đầu Sách</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-sm text-white/70">Khách Hàng</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">20+</p>
              <p className="text-sm text-white/70">Danh Mục</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
