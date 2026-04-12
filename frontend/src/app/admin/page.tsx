"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { AlertTriangle, ArrowRight, Activity, BarChart3, CheckCircle, Clock, DollarSign, Package, RefreshCw, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";

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

const COPY = {
  vi: {
    breadcrumbHome: "Trang chủ",
    dashboard: "Dashboard",
    title: "Bảng điều khiển quản trị",
    welcome: "Xin chào, {name}! Đây là tổng quan cửa hàng.",
    refresh: "Làm mới",
    manageProducts: "Quản lý sản phẩm",
    manageOrders: "Quản lý đơn hàng",
    statOrders: "Tổng đơn hàng",
    statRevenue: "Doanh thu",
    statCustomers: "Khách hàng",
    statPending: "Đơn chờ xử lý",
    lowStock: "{count} sắp hết",
    chartRevenue: "Doanh thu theo tháng",
    chartStatus: "Trạng thái đơn hàng",
    quickActions: "Thao tác nhanh",
    actionAddProduct: "Thêm sản phẩm",
    actionAddProductSub: "Tạo sản phẩm mới",
    actionViewPending: "Xem đơn chờ",
    actionViewPendingSub: "{count} đơn đang chờ",
    actionLowStock: "Sắp hết hàng",
    actionLowStockSub: "{count} sản phẩm",
    actionManageUsers: "Quản lý người dùng",
    actionManageUsersSub: "{count} khách hàng",
    recentOrders: "Đơn hàng gần đây",
    viewAll: "Xem tất cả",
    orderPending: "Chờ xác nhận",
    orderConfirmed: "Đã xác nhận",
    orderShipping: "Đang giao",
    orderDelivered: "Đã giao",
    orderCancelled: "Đã hủy",
    loading: "Đang tải...",
    months: ["T1", "T2", "T3", "T4", "T5", "T6"],
    orderStatus: ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy"],
    recentOrdersData: [
      { id: "ORD001", customer: "Nguyễn Văn A", amount: 450000, status: "pending", time: "5 phút trước" },
      { id: "ORD002", customer: "Trần Thị B", amount: 890000, status: "confirmed", time: "15 phút trước" },
      { id: "ORD003", customer: "Lê Văn C", amount: 320000, status: "shipping", time: "30 phút trước" },
      { id: "ORD004", customer: "Phạm Thị D", amount: 1200000, status: "completed", time: "1 giờ trước" },
    ],
  },
  en: {
    breadcrumbHome: "Home",
    dashboard: "Dashboard",
    title: "Admin dashboard",
    welcome: "Welcome, {name}! Here's your store overview.",
    refresh: "Refresh",
    manageProducts: "Manage products",
    manageOrders: "Manage orders",
    statOrders: "Total orders",
    statRevenue: "Revenue",
    statCustomers: "Customers",
    statPending: "Pending orders",
    lowStock: "{count} low stock",
    chartRevenue: "Monthly revenue",
    chartStatus: "Order status",
    quickActions: "Quick actions",
    actionAddProduct: "Add product",
    actionAddProductSub: "Create a new product",
    actionViewPending: "View pending",
    actionViewPendingSub: "{count} orders waiting",
    actionLowStock: "Low stock",
    actionLowStockSub: "{count} products",
    actionManageUsers: "Manage users",
    actionManageUsersSub: "{count} customers",
    recentOrders: "Recent orders",
    viewAll: "View all",
    orderPending: "Pending",
    orderConfirmed: "Confirmed",
    orderShipping: "Shipping",
    orderDelivered: "Delivered",
    orderCancelled: "Cancelled",
    loading: "Loading...",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    orderStatus: ["Pending", "Confirmed", "Shipping", "Delivered", "Cancelled"],
    recentOrdersData: [
      { id: "ORD001", customer: "Olivia Parker", amount: 450000, status: "pending", time: "5 minutes ago" },
      { id: "ORD002", customer: "Ethan Brooks", amount: 890000, status: "confirmed", time: "15 minutes ago" },
      { id: "ORD003", customer: "Sophia Reed", amount: 320000, status: "shipping", time: "30 minutes ago" },
      { id: "ORD004", customer: "Noah Grant", amount: 1200000, status: "completed", time: "1 hour ago" },
    ],
  },
} as const;

const QUICK_ACTION_STYLES = {
  blue: {
    panel: "bg-blue-50/70 hover:bg-blue-100/70",
    icon: "bg-blue-100 text-blue-600",
  },
  yellow: {
    panel: "bg-yellow-50/70 hover:bg-yellow-100/70",
    icon: "bg-yellow-100 text-yellow-600",
  },
  red: {
    panel: "bg-red-50/70 hover:bg-red-100/70",
    icon: "bg-red-100 text-red-600",
  },
  purple: {
    panel: "bg-purple-50/70 hover:bg-purple-100/70",
    icon: "bg-purple-100 text-purple-600",
  },
} as const;

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { isAdmin } = useAuth();
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data as DashboardStats;
    },
    refetchInterval: 30000,
  });

  const orderStatusData = stats
    ? [
        { name: copy.orderStatus[0], value: stats.pendingOrders },
        { name: copy.orderStatus[1], value: Math.floor(stats.totalOrders * 0.2) },
        { name: copy.orderStatus[2], value: Math.floor(stats.totalOrders * 0.15) },
        { name: copy.orderStatus[3], value: stats.completedOrders },
        { name: copy.orderStatus[4], value: Math.floor(stats.totalOrders * 0.1) },
      ]
    : [];

  const revenueData = copy.months.map((month, index) => ({
    name: month,
    revenue: [15000000, 18000000, 22000000, 19500000, 28000000, 32000000][index],
  }));

  const recentOrders = copy.recentOrdersData;

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                {copy.breadcrumbHome}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{copy.dashboard}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {copy.title}
            </h1>
            <p className="text-gray-500 mt-1">
              {copy.welcome.replace("{name}", user?.fullName ?? "Admin")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              {copy.refresh}
            </Button>
            <Link href="/admin/products">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 rounded-xl">
                <Package className="h-4 w-4 mr-2" />
                {copy.manageProducts}
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 rounded-xl">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {copy.manageOrders}
              </Button>
            </Link>
          </div>
        </div>

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
              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-all duration-300">
                        <ShoppingCart className="h-7 w-7 text-white" />
                      </div>
                      <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{stats?.newOrdersThisMonth}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{copy.statOrders}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders?.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-all duration-300">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                      <div className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{((stats?.revenueThisMonth || 0) / (stats?.totalRevenue || 1) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{copy.statRevenue}</p>
                    <p className="text-2xl xl:text-3xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-all duration-300">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
                        {stats?.totalProducts} SP
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{copy.statCustomers}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers?.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                  <div className="relative">
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
                          {copy.lowStock.replace("{count}", String(stats?.lowStockProducts || 0))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{copy.statPending}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.pendingOrders}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{copy.chartRevenue}</span>
              </CardTitle>
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
                        padding: "12px 16px",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{copy.chartStatus}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center">
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" animationDuration={1500}>
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
                          padding: "12px 16px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 w-full">{copy.loading}</div>
                )}
              </div>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{copy.quickActions}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: "/admin/products", icon: Package, label: copy.actionAddProduct, sublabel: copy.actionAddProductSub, tone: "blue" as const },
                  { href: "/admin/orders", icon: Clock, label: copy.actionViewPending, sublabel: copy.actionViewPendingSub.replace("{count}", String(stats?.pendingOrders || 0)), tone: "yellow" as const },
                  { href: "/admin/products?filter=low-stock", icon: AlertTriangle, label: copy.actionLowStock, sublabel: copy.actionLowStockSub.replace("{count}", String(stats?.lowStockProducts || 0)), tone: "red" as const },
                  { href: "/admin/users", icon: Users, label: copy.actionManageUsers, sublabel: copy.actionManageUsersSub.replace("{count}", String(stats?.totalUsers || 0)), tone: "purple" as const },
                ].map((action) => {
                  const styles = QUICK_ACTION_STYLES[action.tone];
                  const Icon = action.icon;
                  return (
                    <Link key={action.href} href={action.href}>
                      <div className={cn("p-4 border border-gray-100 rounded-xl hover:border-transparent transition-all duration-300 group", styles.panel)}>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110", styles.icon)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</p>
                        <p className="text-sm text-gray-500">{action.sublabel}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{copy.recentOrders}</span>
                </CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    {copy.viewAll}
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
                        {order.status === "pending"
                          ? copy.orderPending
                          : order.status === "confirmed"
                            ? copy.orderConfirmed
                            : order.status === "shipping"
                              ? copy.orderShipping
                              : order.status === "completed"
                                ? copy.orderDelivered
                                : copy.orderCancelled}
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
