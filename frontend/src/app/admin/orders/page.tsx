"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Eye,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  user: { id: number; email: string; fullName: string };
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  orderItems: OrderItem[];
  shippingAddress: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const PAYMENT_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const COPY = {
  vi: {
    breadcrumb: "Admin",
    title: "Quản lý đơn hàng",
    subtitle: "Theo dõi các đơn hàng đang xử lý và lịch sử giao dịch.",
    totalOrders: "Tổng đơn",
    pending: "Chờ xác nhận",
    shipping: "Đang giao",
    delivered: "Đã giao",
    listTitle: "Danh sách đơn hàng",
    searchPlaceholder: "Tìm theo mã đơn hoặc email...",
    statusPlaceholder: "Lọc theo trạng thái",
    all: "Tất cả",
    orderCode: "Mã đơn",
    customer: "Khách hàng",
    date: "Ngày đặt",
    amount: "Tổng tiền",
    status: "Trạng thái",
    payment: "Thanh toán",
    items: "SP",
    action: "Hành động",
    empty: "Không có đơn hàng nào phù hợp.",
    page: "Trang {current} / {total}",
    prev: "Trước",
    next: "Sau",
    view: "Xem chi tiết đơn hàng",
    statusLabels: {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
    },
    paymentLabels: {
      PENDING: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      FAILED: "Thanh toán thất bại",
      REFUNDED: "Đã hoàn tiền",
    },
  },
  en: {
    breadcrumb: "Admin",
    title: "Order management",
    subtitle: "Track in-progress orders and the latest transaction history.",
    totalOrders: "Total orders",
    pending: "Pending",
    shipping: "Shipping",
    delivered: "Delivered",
    listTitle: "Order list",
    searchPlaceholder: "Search by order code or email...",
    statusPlaceholder: "Filter by status",
    all: "All",
    orderCode: "Order code",
    customer: "Customer",
    date: "Date",
    amount: "Amount",
    status: "Status",
    payment: "Payment",
    items: "Items",
    action: "Action",
    empty: "No orders match the current filter.",
    page: "Page {current} / {total}",
    prev: "Previous",
    next: "Next",
    view: "View order details",
    statusLabels: {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipping",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    },
    paymentLabels: {
      PENDING: "Awaiting payment",
      PAID: "Paid",
      FAILED: "Payment failed",
      REFUNDED: "Refunded",
    },
  },
} as const;

export default function AdminOrdersPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isAdmin,
    isLoading: isAuthLoading,
  } = useAuth(true, true);
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PageResponse<Order>>({
    queryKey: ["admin-orders", page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
      });

      if (status) {
        params.set("status", status);
      }

      if (search) {
        params.set("search", search);
      }

      const response = await api.get(`/admin/orders?${params.toString()}`);
      return response.data;
    },
    retry: false,
  });

  if (isAuthLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const statusOptions = [
    { value: "all", label: copy.all },
    { value: "PENDING", label: copy.statusLabels.PENDING },
    { value: "CONFIRMED", label: copy.statusLabels.CONFIRMED },
    { value: "PROCESSING", label: copy.statusLabels.PROCESSING },
    { value: "SHIPPED", label: copy.statusLabels.SHIPPED },
    { value: "DELIVERED", label: copy.statusLabels.DELIVERED },
    { value: "CANCELLED", label: copy.statusLabels.CANCELLED },
  ];

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING",
  ).length;
  const shippedCount = orders.filter(
    (order) => order.status === "SHIPPED",
  ).length;
  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/admin"
              className="hover:text-blue-600 transition-colors"
            >
              {copy.breadcrumb}
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{copy.title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
          <p className="mt-2 text-gray-600">{copy.subtitle}</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            {
              label: copy.totalOrders,
              value: totalElements,
              icon: ShoppingCart,
              tone: "bg-blue-100 text-blue-600",
            },
            {
              label: copy.pending,
              value: pendingCount,
              icon: Clock,
              tone: "bg-yellow-100 text-yellow-600",
            },
            {
              label: copy.shipping,
              value: shippedCount,
              icon: Truck,
              tone: "bg-orange-100 text-orange-600",
            },
            {
              label: copy.delivered,
              value: deliveredCount,
              icon: CheckCircle,
              tone: "bg-green-100 text-green-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="rounded-2xl border-0 shadow-lg">
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-gray-50/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>{copy.listTitle}</CardTitle>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative md:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(0);
                    }}
                    placeholder={copy.searchPlaceholder}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={status || "all"}
                  onValueChange={(value) => {
                    setStatus(value === "all" ? "" : value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-full md:w-52">
                    <SelectValue placeholder={copy.statusPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/60">
                    <TableHead>{copy.orderCode}</TableHead>
                    <TableHead>{copy.customer}</TableHead>
                    <TableHead>{copy.date}</TableHead>
                    <TableHead className="text-right">{copy.amount}</TableHead>
                    <TableHead>{copy.status}</TableHead>
                    <TableHead>{copy.payment}</TableHead>
                    <TableHead className="text-center">{copy.items}</TableHead>
                    <TableHead className="text-right">{copy.action}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 8 }).map((__, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-14 text-center text-gray-500"
                      >
                        {copy.empty}
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-xs font-medium text-blue-600">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.user.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString(
                            locale === "vi" ? "vi-VN" : "en-US",
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              STATUS_STYLES[order.status] ||
                                "bg-gray-100 text-gray-700",
                            )}
                          >
                            {copy.statusLabels[
                              order.status as keyof typeof copy.statusLabels
                            ] ?? order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium",
                              PAYMENT_STYLES[order.paymentStatus] ||
                                "bg-gray-100 text-gray-700",
                            )}
                          >
                            {copy.paymentLabels[
                              order.paymentStatus as keyof typeof copy.paymentLabels
                            ] ?? order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {order.orderItems.length}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={copy.view}
                              className="h-9 w-9"
                              onClick={() =>
                                router.push(`/admin/orders/${order.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-gray-500">
                  {copy.page
                    .replace("{current}", String(page + 1))
                    .replace("{total}", String(totalPages))}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {copy.prev}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages - 1, value + 1))
                    }
                  >
                    {copy.next}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
