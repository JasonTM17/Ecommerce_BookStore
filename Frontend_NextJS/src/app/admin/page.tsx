"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatCurrency } from "@/lib/utils";
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng Người Dùng",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Tổng Sản Phẩm",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Tổng Đơn Hàng",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-orange-500",
      change: "+20%",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Tổng quan về cửa hàng</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Đơn Hàng</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Chờ xác nhận</span>
                  <span className="font-bold text-yellow-600">{stats?.pendingOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đã giao</span>
                  <span className="font-bold text-green-600">{stats?.completedOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn tháng này</span>
                  <span className="font-bold text-blue-600">{stats?.newOrdersThisMonth || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Doanh Thu</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng doanh thu</span>
                  <span className="font-bold text-green-600">{formatCurrency(stats?.totalRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Doanh thu tháng này</span>
                  <span className="font-bold text-blue-600">{formatCurrency(stats?.revenueThisMonth || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Cảnh Báo
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sản phẩm sắp hết</span>
                  <span className="font-bold text-red-600">{stats?.lowStockProducts || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/admin/products")}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-center">Quản lý Sản phẩm</p>
              </button>
              <button
                onClick={() => router.push("/admin/orders")}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-center">Quản lý Đơn hàng</p>
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-center">Quản lý Người dùng</p>
              </button>
              <button
                onClick={() => router.push("/admin/categories")}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-center">Quản lý Danh mục</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
