"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  User,
  Calendar,
  FileText,
  Save,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
  user: { id: number; email: string; fullName: string; phone?: string };
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  orderItems: OrderItem[];
  shippingAddress: string;
  shippingPhone: string;
  shippingReceiverName: string;
  shippingMethod?: string;
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: "Chờ xác nhận", color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle },
  PROCESSING: { label: "Đang xử lý", color: "text-purple-700", bg: "bg-purple-100", icon: Package },
  SHIPPED: { label: "Đang giao", color: "text-orange-700", bg: "bg-orange-100", icon: Truck },
  DELIVERED: { label: "Đã giao", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Chờ thanh toán", color: "text-yellow-700", bg: "bg-yellow-100" },
  PAID: { label: "Đã thanh toán", color: "text-green-700", bg: "bg-green-100" },
  FAILED: { label: "Thanh toán thất bại", color: "text-red-700", bg: "bg-red-100" },
  REFUNDED: { label: "Đã hoàn tiền", color: "text-gray-700", bg: "bg-gray-100" },
  CANCELLED: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-100" },
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao hàng" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "CANCELLED", label: "Hủy đơn hàng" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "FAILED", label: "Thanh toán thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
    retry: false,
  });

  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, paymentStatus }: { status?: string; paymentStatus?: string }) => {
      if (status) {
        await api.put(`/admin/orders/${orderId}/status?status=${status}`);
      }
      if (paymentStatus) {
        await api.put(`/admin/orders/${orderId}/payment?paymentStatus=${paymentStatus}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: () => {
      toast.error("Cập nhật trạng thái thất bại");
    },
  });

  const handleUpdateStatus = () => {
    updateStatusMutation.mutate({
      status: newStatus || undefined,
      paymentStatus: newPaymentStatus || undefined,
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/orders" className="hover:text-blue-600 transition-colors">Quản lý đơn hàng</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Chi tiết đơn hàng</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-48 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Đơn hàng #{order?.orderNumber}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Đặt lúc {order ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/orders")}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-64 w-full rounded-xl" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full rounded-xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : order ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Sản phẩm trong đơn ({order.orderItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="p-4 md:p-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                          <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                width={64}
                                height={80}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{item.productName}</h4>
                          <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.price)} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Tổng kết đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thuế</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.taxAmount)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá</span>
                        <span className="font-medium">-{formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                        <span className="text-xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Status */}
              <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Trạng thái đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
                    <Badge className={cn("text-sm px-3 py-1", STATUS_CONFIG[order.status]?.bg, STATUS_CONFIG[order.status]?.color)}>
                      {STATUS_CONFIG[order.status]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Thanh toán</p>
                    <Badge className={cn("text-sm px-3 py-1", PAYMENT_STATUS_CONFIG[order.paymentStatus]?.bg, PAYMENT_STATUS_CONFIG[order.paymentStatus]?.color)}>
                      {PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label}
                    </Badge>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-3">Cập nhật trạng thái</p>
                    <div className="space-y-3">
                      <Select onValueChange={setNewStatus} value={newStatus}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Chọn trạng thái đơn" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={setNewPaymentStatus} value={newPaymentStatus}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Chọn thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleUpdateStatus}
                        disabled={!newStatus && !newPaymentStatus || updateStatusMutation.isPending}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        {updateStatusMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Cập nhật
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {order.user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.user.fullName}</p>
                      <p className="text-sm text-gray-500">{order.user.email}</p>
                    </div>
                  </div>
                  {order.user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {order.user.phone}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Người nhận</p>
                      <p className="font-medium text-gray-900">{order.shippingReceiverName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium text-gray-900">{order.shippingPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                    </div>
                    {order.shippingMethod && (
                      <div>
                        <p className="text-sm text-gray-500">Phương thức vận chuyển</p>
                        <p className="font-medium text-gray-900">{order.shippingMethod}</p>
                      </div>
                    )}
                    {order.paymentMethod && (
                      <div>
                        <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {order.notes && (
                <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Ghi chú
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="rounded-2xl border-0 shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-500 mb-6">Đơn hàng này không tồn tại hoặc đã bị xóa</p>
            <Button onClick={() => router.push("/admin/orders")} variant="outline" className="rounded-xl">
              Quay lại danh sách
            </Button>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
