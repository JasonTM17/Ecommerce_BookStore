"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 mt-1">
            Tổng cộng {totalElements} đơn hàng
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
              <CardTitle className="text-lg">Danh sách đơn hàng</CardTitle>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã đơn, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-44">
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
                  <TableRow>
                    <TableHead className="w-32">Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="w-24">Ngày đặt</TableHead>
                    <TableHead className="text-right w-32">Tổng tiền</TableHead>
                    <TableHead className="w-28">Trạng thái</TableHead>
                    <TableHead className="w-24">Thanh toán</TableHead>
                    <TableHead className="text-center w-16">SP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : orders.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                            Không có đơn hàng nào
                          </TableCell>
                        </TableRow>
                      )
                    : orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs font-medium">
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
                              className={`${STATUS_COLORS[order.status]?.bg} ${STATUS_COLORS[order.status]?.text} border ${STATUS_COLORS[order.status]?.border} text-xs`}
                            >
                              {STATUS_LABELS.find((s) => s.val === order.status)?.label ?? order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${PAYMENT_COLORS[order.paymentStatus]?.bg} ${PAYMENT_COLORS[order.paymentStatus]?.text} text-xs`}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-500">
                            {order.orderItems.length}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-500">
                  Trang {page + 1} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
