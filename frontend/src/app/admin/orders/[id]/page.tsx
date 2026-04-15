"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Save,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn, formatCurrency } from "@/lib/utils";

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
}

const BADGE_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const COPY = {
  vi: {
    breadcrumb: "Admin",
    orders: "Quản lý đơn hàng",
    details: "Chi tiết đơn hàng",
    placedAt: "Đặt lúc {date}",
    back: "Quay lại",
    items: "Sản phẩm trong đơn",
    summary: "Tổng kết đơn hàng",
    subtotal: "Tạm tính",
    shippingFee: "Phí vận chuyển",
    tax: "Thuế",
    discount: "Giảm giá",
    total: "Tổng cộng",
    status: "Trạng thái đơn hàng",
    payment: "Thanh toán",
    updateStatus: "Cập nhật trạng thái",
    chooseStatus: "Chọn trạng thái đơn hàng",
    choosePayment: "Chọn trạng thái thanh toán",
    customer: "Thông tin khách hàng",
    shippingInfo: "Địa chỉ giao hàng",
    receiver: "Người nhận",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    method: "Phương thức vận chuyển",
    paymentMethod: "Phương thức thanh toán",
    notes: "Ghi chú",
    quantity: "Số lượng",
    emptyTitle: "Không tìm thấy đơn hàng",
    emptyDesc: "Đơn hàng này không tồn tại hoặc đã bị xóa.",
    backToList: "Về danh sách đơn hàng",
    updateSuccess: "Đã cập nhật trạng thái đơn hàng.",
    updateError: "Không thể cập nhật trạng thái lúc này.",
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
    orders: "Order management",
    details: "Order details",
    placedAt: "Placed at {date}",
    back: "Back",
    items: "Items in order",
    summary: "Order summary",
    subtotal: "Subtotal",
    shippingFee: "Shipping fee",
    tax: "Tax",
    discount: "Discount",
    total: "Total",
    status: "Order status",
    payment: "Payment",
    updateStatus: "Update status",
    chooseStatus: "Choose order status",
    choosePayment: "Choose payment status",
    customer: "Customer information",
    shippingInfo: "Shipping address",
    receiver: "Recipient",
    phone: "Phone number",
    address: "Address",
    method: "Shipping method",
    paymentMethod: "Payment method",
    notes: "Notes",
    quantity: "Quantity",
    emptyTitle: "Order not found",
    emptyDesc: "This order does not exist or has already been removed.",
    backToList: "Back to order list",
    updateSuccess: "Order status updated successfully.",
    updateError: "Unable to update the order right now.",
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    isAdmin,
    isLoading: isAuthLoading,
  } = useAuth(true, true);
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const orderId = String(params.id);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const response = await api.get(`/admin/orders/${orderId}`);
      return response.data;
    },
    enabled: Boolean(orderId),
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      status,
      paymentStatus,
    }: {
      status?: string;
      paymentStatus?: string;
    }) => {
      if (status) {
        await api.put(`/admin/orders/${orderId}/status?status=${status}`);
      }

      if (paymentStatus) {
        await api.put(
          `/admin/orders/${orderId}/payment?paymentStatus=${paymentStatus}`,
        );
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-order", orderId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(copy.updateSuccess);
      setNewStatus("");
      setNewPaymentStatus("");
    },
    onError: () => {
      toast.error(copy.updateError);
    },
  });

  const statusOptions = useMemo(
    () => [
      { value: "PENDING", label: copy.statusLabels.PENDING },
      { value: "CONFIRMED", label: copy.statusLabels.CONFIRMED },
      { value: "PROCESSING", label: copy.statusLabels.PROCESSING },
      { value: "SHIPPED", label: copy.statusLabels.SHIPPED },
      { value: "DELIVERED", label: copy.statusLabels.DELIVERED },
      { value: "CANCELLED", label: copy.statusLabels.CANCELLED },
    ],
    [copy],
  );

  const paymentOptions = useMemo(
    () => [
      { value: "PENDING", label: copy.paymentLabels.PENDING },
      { value: "PAID", label: copy.paymentLabels.PAID },
      { value: "FAILED", label: copy.paymentLabels.FAILED },
      { value: "REFUNDED", label: copy.paymentLabels.REFUNDED },
    ],
    [copy],
  );

  if (isAuthLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

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
            <Link
              href="/admin/orders"
              className="hover:text-blue-600 transition-colors"
            >
              {copy.orders}
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{copy.details}</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-10 w-40" />
                  <Skeleton className="h-5 w-60" />
                </>
              ) : order ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900">
                    #{order.orderNumber}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {copy.placedAt.replace(
                      "{date}",
                      new Date(order.createdAt).toLocaleString(
                        locale === "vi" ? "vi-VN" : "en-US",
                      ),
                    )}
                  </p>
                </>
              ) : null}
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/admin/orders")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {copy.back}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-[520px] w-full rounded-2xl" />
            <Skeleton className="h-[520px] w-full rounded-2xl" />
          </div>
        ) : order ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>
                      {copy.items} ({order.orderItems.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
                    >
                        <div className="flex h-20 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          {item.imageUrl ? (
                            <ProductImage
                              src={item.imageUrl}
                              fallbackSrc="/images/books/placeholders/default.svg"
                              alt={item.productName}
                              width={64}
                              height={80}
                              sizes="64px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                          <span className="text-lg text-gray-400">B</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-medium text-gray-900">
                          {item.productName}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {copy.quantity}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {copy.summary}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{copy.subtotal}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{copy.shippingFee}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{copy.tax}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.taxAmount)}
                    </span>
                  </div>
                  {order.discountAmount > 0 ? (
                    <div className="flex justify-between text-green-600">
                      <span>{copy.discount}</span>
                      <span className="font-medium">
                        -{formatCurrency(order.discountAmount)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-base font-semibold text-gray-900">
                      {copy.total}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    {copy.status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{copy.status}</p>
                    <Badge
                      className={cn(
                        "font-medium",
                        BADGE_STYLES[order.status] ||
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {copy.statusLabels[
                        order.status as keyof typeof copy.statusLabels
                      ] ?? order.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{copy.payment}</p>
                    <Badge
                      className={cn(
                        "font-medium",
                        BADGE_STYLES[order.paymentStatus] ||
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {copy.paymentLabels[
                        order.paymentStatus as keyof typeof copy.paymentLabels
                      ] ?? order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="space-y-3 border-t pt-4">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder={copy.chooseStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={newPaymentStatus}
                      onValueChange={setNewPaymentStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={copy.choosePayment} />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      className="w-full"
                      disabled={
                        (!newStatus && !newPaymentStatus) ||
                        updateMutation.isPending
                      }
                      onClick={() =>
                        updateMutation.mutate({
                          status: newStatus || undefined,
                          paymentStatus: newPaymentStatus || undefined,
                        })
                      }
                    >
                      {updateMutation.isPending ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {copy.updateStatus}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {copy.customer}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-semibold text-gray-900">
                    {order.user.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{order.user.email}</p>
                  {order.user.phone ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {order.user.phone}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {copy.shippingInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">{copy.receiver}</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingReceiverName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{copy.phone}</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{copy.address}</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress}
                    </p>
                  </div>
                  {order.shippingMethod ? (
                    <div>
                      <p className="text-gray-500">{copy.method}</p>
                      <p className="font-medium text-gray-900">
                        {order.shippingMethod}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-gray-500">{copy.paymentMethod}</p>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {order.notes ? (
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>{copy.notes}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        ) : (
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900">
                {copy.emptyTitle}
              </h2>
              <p className="mt-2 text-gray-600">{copy.emptyDesc}</p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => router.push("/admin/orders")}
              >
                {copy.backToList}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
