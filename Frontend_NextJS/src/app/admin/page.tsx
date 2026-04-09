"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useAuth } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  newOrdersThisMonth: number;
  revenueThisMonth: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data as DashboardStats;
    },
    enabled: !!isAuthenticated && !!isAdmin,
  });

  // Mock chart data
  const orderStatusData = stats
    ? [
        { name: "Chờ xác nhận", value: stats.pendingOrders, color: "#f59e0b" },
        { name: "Đã xác nhận", value: Math.floor(stats.totalOrders * 0.2), color: "#3b82f6" },
        { name: "Đang giao", value: Math.floor(stats.totalOrders * 0.15), color: "#8b5cf6" },
        { name: "Đã giao", value: stats.completedOrders, color: "#22c55e" },
        { name: "Đã hủy", value: Math.floor(stats.totalOrders * 0.1), color: "#ef4444" },
      ]
    : [];

  const revenueData = [
    { name: "T1", revenue: 15000000 },
    { name: "T2", revenue: 18000000 },
    { name: "T3", revenue: 22000000 },
    { name: "T4", revenue: 19500000 },
    { name: "T5", revenue: 28000000 },
    { name: "T6", revenue: 32000000 },
  ];

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Xin chào, {user?.fullName}! Đây là tổng quan cửa hàng.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/products">
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Quản lý Sản phẩm
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Quản lý Đơn hàng
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                      <p className="text-3xl font-bold mt-1">{stats?.totalOrders?.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{stats?.newOrdersThisMonth} tháng này
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                      <p className="text-3xl font-bold mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{formatCurrency(stats?.revenueThisMonth || 0)} tháng này
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Khách hàng</p>
                      <p className="text-3xl font-bold mt-1">{stats?.totalUsers?.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    {stats?.totalProducts} sản phẩm
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Đơn chờ xử lý</p>
                      <p className="text-3xl font-bold mt-1">{stats?.pendingOrders}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {stats?.lowStockProducts} sản phẩm sắp hết hàng
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Doanh Thu Theo Tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Trạng Thái Đơn Hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center">
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 w-full">Đang tải...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao Tác Nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/products">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Package className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium">Thêm sản phẩm mới</p>
                  <p className="text-sm text-gray-500">Tạo sản phẩm mới</p>
                </div>
              </Link>
              <Link href="/admin/orders">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                  <p className="font-medium">Xem đơn chờ</p>
                  <p className="text-sm text-gray-500">{stats?.pendingOrders} đơn đang chờ</p>
                </div>
              </Link>
              <Link href="/admin/products?filter=low-stock">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                  <p className="font-medium">Sắp hết hàng</p>
                  <p className="text-sm text-gray-500">{stats?.lowStockProducts} sản phẩm</p>
                </div>
              </Link>
              <Link href="/admin/users">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium">Quản lý users</p>
                  <p className="text-sm text-gray-500">{stats?.totalUsers} khách hàng</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
