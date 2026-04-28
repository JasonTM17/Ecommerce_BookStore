"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

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
    title: "Bảng điều khiển quản trị",
    welcome: "Xin chào, {name}! Đây là tổng quan nhanh cho bản demo hiện tại.",
    refresh: "Làm mới",
    orders: "Đơn hàng",
    revenue: "Doanh thu",
    customers: "Khách hàng",
    pending: "Chờ xử lý",
    products: "Sản phẩm",
    lowStock: "{count} sản phẩm sắp hết hàng",
    quickActions: "Tác vụ chính",
    productsAction: "Quản lý sản phẩm",
    productsActionSub: "Rà soát catalog và tồn kho hiện tại",
    ordersAction: "Quản lý đơn hàng",
    ordersActionSub: "Theo dõi các đơn đang chờ hoặc đang giao",
    usersAction: "Quản lý người dùng",
    usersActionSub: "Xem tài khoản khách hàng và trạng thái hoạt động",
    summaryTitle: "Tóm tắt vận hành",
    summaryOrders: "{count} đơn mới trong tháng này",
    summaryRevenue: "Doanh thu tháng này đạt {amount}",
    summaryCompleted: "{count} đơn đã hoàn tất",
    loading: "Đang tải bảng điều khiển...",
  },
  en: {
    breadcrumbHome: "Home",
    title: "Admin dashboard",
    welcome:
      "Welcome, {name}! Here is a quick overview of the current demo store.",
    refresh: "Refresh",
    orders: "Orders",
    revenue: "Revenue",
    customers: "Customers",
    pending: "Pending",
    products: "Products",
    lowStock: "{count} products are running low",
    quickActions: "Core actions",
    productsAction: "Manage products",
    productsActionSub: "Review the live catalog and stock status",
    ordersAction: "Manage orders",
    ordersActionSub: "Track pending and in-progress orders",
    usersAction: "Manage users",
    usersActionSub: "Inspect customer accounts and access states",
    summaryTitle: "Operational summary",
    summaryOrders: "{count} new orders this month",
    summaryRevenue: "This month's revenue reached {amount}",
    summaryCompleted: "{count} orders have been completed",
    loading: "Loading dashboard...",
  },
} as const;

export default function AdminDashboard() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isAdmin,
    isLoading: isAuthLoading,
  } = useAuth();
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const hasSessionCookie =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((cookie) => {
      const normalized = cookie.trim();
      return (
        normalized.startsWith("access_token=") ||
        normalized.startsWith("refresh_token=")
      );
    });
  const isRestoringSession = !isAuthenticated && !user && hasSessionCookie;
  const isResolvingAuth = isAuthLoading || isRestoringSession;

  useEffect(() => {
    if (isResolvingAuth) {
      return;
    }

    if (!isAuthenticated || !isAdmin) {
      router.replace("/login");
    }
  }, [isResolvingAuth, isAuthenticated, isAdmin, router]);

  const {
    data: stats,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data as DashboardStats;
    },
    refetchInterval: 30000,
  });

  if (isResolvingAuth || !isAuthenticated || !isAdmin) {
    return null;
  }

  const summaryCards = [
    {
      label: copy.orders,
      value: stats?.totalOrders ?? 0,
      detail: copy.summaryOrders.replace(
        "{count}",
        String(stats?.newOrdersThisMonth ?? 0),
      ),
      icon: ShoppingCart,
    },
    {
      label: copy.revenue,
      value: formatCurrency(stats?.totalRevenue ?? 0),
      detail: copy.summaryRevenue.replace(
        "{amount}",
        formatCurrency(stats?.revenueThisMonth ?? 0),
      ),
      icon: DollarSign,
    },
    {
      label: copy.customers,
      value: stats?.totalUsers ?? 0,
      detail: `${stats?.totalProducts ?? 0} ${copy.products.toLowerCase()}`,
      icon: Users,
    },
    {
      label: copy.pending,
      value: stats?.pendingOrders ?? 0,
      detail: copy.summaryCompleted.replace(
        "{count}",
        String(stats?.completedOrders ?? 0),
      ),
      icon: AlertTriangle,
    },
  ];

  const quickActions = [
    {
      href: "/admin/products",
      title: copy.productsAction,
      description: copy.productsActionSub,
      icon: Package,
    },
    {
      href: "/admin/orders",
      title: copy.ordersAction,
      description: copy.ordersActionSub,
      icon: ShoppingCart,
    },
    {
      href: "/admin/users",
      title: copy.usersAction,
      description: copy.usersActionSub,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                {copy.breadcrumbHome}
              </Link>
              <span>/</span>
              <span className="font-medium text-gray-900">Admin</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              {copy.welcome.replace("{name}", user?.fullName ?? "Admin")}
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {copy.refresh}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="rounded-2xl border-0 shadow-lg">
                  <CardContent className="space-y-3 p-6">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
              ))
            : summaryCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    className="rounded-2xl border-0 shadow-lg"
                  >
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                          <Icon className="h-6 w-6" />
                        </div>
                        {item.label === copy.pending &&
                        (stats?.lowStockProducts ?? 0) > 0 ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                            {copy.lowStock.replace(
                              "{count}",
                              String(stats?.lowStockProducts ?? 0),
                            )}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                          {item.value}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{item.detail}</p>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{copy.quickActions}</CardTitle>
              <CardDescription>
                {locale === "vi"
                  ? "Các đường dẫn quản trị đang được duy trì ổn định cho portfolio."
                  : "The main admin routes are kept stable for the portfolio demo."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-semibold text-gray-900 transition group-hover:text-blue-600">
                      {action.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      {action.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <span>
                        {locale === "vi" ? "Mở màn hình" : "Open view"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{copy.summaryTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-medium text-gray-900">
                  {copy.summaryOrders.replace(
                    "{count}",
                    String(stats?.newOrdersThisMonth ?? 0),
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-medium text-gray-900">
                  {copy.summaryRevenue.replace(
                    "{amount}",
                    formatCurrency(stats?.revenueThisMonth ?? 0),
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-medium text-gray-900">
                  {copy.summaryCompleted.replace(
                    "{count}",
                    String(stats?.completedOrders ?? 0),
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-blue-700">
                {locale === "vi"
                  ? `Catalog hiện có ${stats?.totalProducts ?? 0} sản phẩm và ${stats?.lowStockProducts ?? 0} điểm cần chú ý về tồn kho.`
                  : `The live catalog currently has ${stats?.totalProducts ?? 0} products and ${stats?.lowStockProducts ?? 0} stock alerts.`}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
