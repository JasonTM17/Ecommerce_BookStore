"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Order, PageResponse } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Eye, CheckCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("");

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", page, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("size", "10");
      if (status) params.set("status", status);
      
      const response = await api.get(`/admin/orders?${params.toString()}`);
      return response.data as PageResponse<Order>;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: number; newStatus: string }) => {
      const response = await api.put(`/admin/orders/${orderId}/status?status=${newStatus}`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Cập nhật trạng thái thành công" });
      refetch();
    },
    onError: () => {
      toast({ title: "Lỗi khi cập nhật trạng thái", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      case "SHIPPED": return "bg-blue-100 text-blue-800";
      case "CONFIRMED": return "bg-purple-100 text-purple-800";
      case "PROCESSING": return "bg-indigo-100 text-indigo-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
              <p className="text-gray-600">Tổng cộng {ordersData?.totalElements || 0} đơn hàng</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-64">
                <label className="text-sm font-medium text-gray-600 mb-1 block">Lọc theo trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Tất cả</option>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="SHIPPED">Đang giao hàng</option>
                  <option value="DELIVERED">Đã giao hàng</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thanh toán</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                    </tr>
                  ) : ordersData?.content.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Không có đơn hàng nào</td>
                    </tr>
                  ) : (
                    ordersData?.content.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.shippingReceiverName}</p>
                          <p className="text-sm text-gray-500">{order.shippingPhone}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateStatusMutation.mutate({ orderId: order.id, newStatus: e.target.value })}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.orderStatus)}`}
                          >
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="SHIPPED">Đang giao hàng</option>
                            <option value="DELIVERED">Đã giao hàng</option>
                            <option value="CANCELLED">Đã hủy</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ordersData && ordersData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-600">
                  Trang {ordersData.page + 1} / {ordersData.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={!ordersData.hasPrevious}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Trước
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={!ordersData.hasNext}>
                    Sau<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
