"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { buildLoginRedirect, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    title: "Đơn Hàng Của Tôi",
    emptyTitle: "Chưa Có Đơn Hàng",
    emptyDescription: "Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!",
    browseProducts: "Khám Phá Sách",
    orderNumber: "Mã đơn hàng",
    orderDate: "Ngày đặt",
    totalAmount: "Tổng tiền",
    detail: "Chi tiết",
    status: "Trạng thái",
    noImage: "Ảnh",
  },
  en: {
    title: "My Orders",
    emptyTitle: "No Orders Yet",
    emptyDescription: "You have not placed any orders yet. Start shopping now!",
    browseProducts: "Browse books",
    orderNumber: "Order number",
    orderDate: "Order date",
    totalAmount: "Total",
    detail: "Details",
    status: "Status",
    noImage: "Image",
  },
} as const;

const STATUS_CONFIG: Record<string, { icon: typeof Package; color: string; bgColor: string }> = {
  PENDING: { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  CONFIRMED: { icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-100" },
  PROCESSING: { icon: Package, color: "text-purple-600", bgColor: "bg-purple-100" },
  SHIPPED: { icon: Truck, color: "text-orange-600", bgColor: "bg-orange-100" },
  DELIVERED: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  REFUNDED: { icon: RotateCcw, color: "text-gray-600", bgColor: "bg-gray-100" },
};

function OrderStatusBadge({ status, displayName }: { status: string; displayName: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.bgColor} ${config.color}`}>
      <Icon className="h-4 w-4" />
      {displayName}
    </span>
  );
}

export default function OrdersPage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/orders");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(buildLoginRedirect("/orders"));
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const orders = ordersData?.content || ordersData || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{copy.title}</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg bg-white p-6 animate-pulse">
                <div className="mb-4 h-4 w-1/4 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-white py-16 text-center">
            <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-gray-300" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">{copy.emptyTitle}</h2>
            <p className="mb-6 text-gray-500">{copy.emptyDescription}</p>
            <Link href="/products">
              <Button>{copy.browseProducts}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: import("@/lib/store").Order) => (
              <div key={order.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{copy.orderNumber}</p>
                      <p className="font-semibold text-primary">{order.orderNumber}</p>
                    </div>
                    <div className="hidden h-8 w-px bg-gray-200 md:block" />
                    <div>
                      <p className="text-sm text-gray-500">{copy.orderDate}</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="hidden h-8 w-px bg-gray-200 md:block" />
                    <div>
                      <p className="text-sm text-gray-500">{copy.totalAmount}</p>
                      <p className="text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.orderStatus} displayName={order.orderStatusDisplayName} />
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        {copy.detail}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.orderItems.slice(0, 4).map((item: import("@/lib/store").OrderItem) => (
                      <div key={item.id} className="flex-shrink-0">
                        <div className="relative h-20 w-16 overflow-hidden rounded bg-gray-100">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-300">
                              {copy.noImage}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 w-16 truncate text-center text-xs font-medium">{item.product.name}</p>
                        <p className="text-center text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="flex h-20 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-100">
                        <span className="text-sm font-medium text-gray-500">+{order.orderItems.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
