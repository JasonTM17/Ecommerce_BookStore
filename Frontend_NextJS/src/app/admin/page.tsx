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
  Activity,
  RefreshCw,
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
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

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
    refetchInterval: 30000, // Refresh every 30 seconds
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
    { name: "T1", revenue: 15000000, orders: 120 },
    { name: "T2", revenue: 18000000, orders: 145 },
    { name: "T3", revenue: 22000000, orders: 180 },
    { name: "T4", revenue: 19500000, orders: 160 },
    { name: "T5", revenue: 28000000, orders: 230 },
    { name: "T6", revenue: 32000000, orders: 280 },
  ];

  const recentOrders = [
    { id: "ORD001", customer: "Nguyễn Văn A", amount: 450000, status: "pending", time: "5 phút trước" },
    { id: "ORD002", customer: "Trần Thị B", amount: 890000, status: "confirmed", time: "15 phút trước" },
    { id: "ORD003", customer: "Lê Văn C", amount: 320000, status: "shipping", time: "30 phút trước" },
    { id: "ORD004", customer: "Phạm Thị D", amount: 1200000, status: "completed", time: "1 giờ trước" },
  ];

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Xin chào, <span className="font-semibold text-blue-600">{user?.fullName}</span>! Đây là tổng quan cửa hàng.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Link href="/admin/products">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 rounded-xl">
                <Package className="h-4 w-4 mr-2" />
                Quản lý Sản phẩm
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 rounded-xl">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Quản lý Đơn hàng
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 mb-4 rounded-xl" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Total Orders */}
              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
                      <ShoppingCart className="h-7 w-7 text-white" />
                    </div>
                    <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{stats?.newOrdersThisMonth}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Tổng đơn hàng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders?.toLocaleString()}</p>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:shadow-green-500/50 transition-all duration-300">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                    <div className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{((stats?.revenueThisMonth || 0) / (stats?.totalRevenue || 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Doanh thu</p>
                  <p className="text-2xl xl:text-3xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </CardContent>
              </Card>

              {/* Customers */}
              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:shadow-purple-500/50 transition-all duration-300">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
                      {stats?.totalProducts} SP
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Khách hàng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers?.toLocaleString()}</p>
                </CardContent>
              </Card>

              {/* Pending Orders */}
              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300",
                      (stats?.pendingOrders || 0) > 5 ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30" : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30"
                    )}>
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    {(stats?.lowStockProducts || 0) > 0 && (
                      <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {stats?.lowStockProducts} sắp hết
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Đơn chờ xử lý</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.pendingOrders}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Doanh Thu Theo Tháng
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "none", 
                        borderRadius: "12px", 
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        padding: "12px 16px"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Trạng Thái Đơn Hàng
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center">
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "none", 
                          borderRadius: "12px", 
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          padding: "12px 16px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 w-full">Đang tải...</div>
                )}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {orderStatusData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-semibold text-gray-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Thao Tác Nhanh
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: "/admin/products", icon: Package, label: "Thêm sản phẩm", sublabel: "Tạo sản phẩm mới", color: "blue" },
                  { href: "/admin/orders", icon: Clock, label: "Xem đơn chờ", sublabel: `${stats?.pendingOrders} đơn đang chờ`, color: "yellow" },
                  { href: "/admin/products?filter=low-stock", icon: AlertTriangle, label: "Sắp hết hàng", sublabel: `${stats?.lowStockProducts} sản phẩm`, color: "red" },
                  { href: "/admin/users", icon: Users, label: "Quản lý users", sublabel: `${stats?.totalUsers} khách hàng`, color: "purple" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className={cn(
                      "p-4 border border-gray-100 rounded-xl hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer group",
                      `hover:bg-gradient-to-br from-${action.color}-50 to-${action.color}-100/50`
                    )}>
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
                        `bg-${action.color}-100`
                      )}>
                        <action.icon className={cn(`h-6 w-6 text-${action.color}-600`)} />
                      </div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</p>
                      <p className="text-sm text-gray-500">{action.sublabel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Đơn Hàng Gần Đây
                  </span>
                </CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Xem tất cả
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                        order.status === "pending" ? "bg-yellow-500" :
                        order.status === "confirmed" ? "bg-blue-500" :
                        order.status === "shipping" ? "bg-purple-500" : "bg-green-500"
                      )}>
                        {order.id.slice(-3)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        order.status === "shipping" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                      )}>
                        {order.status === "pending" ? "Chờ xác nhận" :
                         order.status === "confirmed" ? "Đã xác nhận" :
                         order.status === "shipping" ? "Đang giao" : "Hoàn thành"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
