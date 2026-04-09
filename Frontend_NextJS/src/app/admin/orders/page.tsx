"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Truck,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  PROCESSING: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  SHIPPED: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  DELIVERED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const STATUS_LABELS = [
  { val: "", label: "Tất cả" },
  { val: "PENDING", label: "Chờ xác nhận" },
  { val: "CONFIRMED", label: "Đã xác nhận" },
  { val: "PROCESSING", label: "Đang xử lý" },
  { val: "SHIPPED", label: "Đang giao" },
  { val: "DELIVERED", label: "Đã giao" },
  { val: "CANCELLED", label: "Đã hủy" },
];

const PAYMENT_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
  PAID: { bg: "bg-green-100", text: "text-green-800" },
  FAILED: { bg: "bg-red-100", text: "text-red-800" },
  REFUNDED: { bg: "bg-gray-100", text: "text-gray-800" },
};

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
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

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PageResponse<Order>>({
    queryKey: ["admin-orders", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
      });
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const res = await api.get(`/orders/admin?${params}`);
      return res.data;
    },
  });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  // Stats
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Quản lý đơn hàng</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Quản lý Đơn hàng
          </h1>
          <p className="text-gray-500 mt-1">
            Tổng cộng <span className="font-semibold text-blue-600">{totalElements}</span> đơn hàng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chờ xác nhận</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đang giao</p>
                  <p className="text-2xl font-bold text-gray-900">{shippedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đã giao</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng đơn</p>
                  <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Danh sách đơn hàng</span>
              </CardTitle>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm theo mã đơn, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-44 h-10 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_LABELS.map((s) => (
                      <SelectItem key={s.val} value={s.val}>
                        {s.label}
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
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-32">Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="w-24">Ngày đặt</TableHead>
                    <TableHead className="text-right w-32">Tổng tiền</TableHead>
                    <TableHead className="w-28">Trạng thái</TableHead>
                    <TableHead className="w-24">Thanh toán</TableHead>
                    <TableHead className="text-center w-16">SP</TableHead>
                    <TableHead className="w-20">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : orders.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Không có đơn hàng nào</p>
                          </TableCell>
                        </TableRow>
                      )
                    : orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-mono text-xs font-medium text-blue-600">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{order.user.fullName}</p>
                              <p className="text-gray-400 text-xs">{order.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-xs font-medium",
                                STATUS_COLORS[order.status]?.bg,
                                STATUS_COLORS[order.status]?.text
                              )}
                            >
                              {STATUS_LABELS.find((s) => s.val === order.status)?.label ?? order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-xs font-medium",
                                PAYMENT_COLORS[order.paymentStatus]?.bg,
                                PAYMENT_COLORS[order.paymentStatus]?.text
                              )}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-500">
                            {order.orderItems.length}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <p className="text-sm text-gray-500">
                  Trang {page + 1} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-xl h-9"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="rounded-xl h-9"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
