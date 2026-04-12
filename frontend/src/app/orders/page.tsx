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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      <Icon className="h-4 w-4" />
      {displayName}
    </span>
  );
}

export default function OrdersPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn Hàng Của Tôi</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa Có Đơn Hàng</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            <Link href="/products">
              <Button>Khám Phá Sách</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: import("@/lib/store").Order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Mã đơn hàng</p>
                      <p className="font-semibold text-primary">{order.orderNumber}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200 hidden md:block" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-gray-200 hidden md:block" />
                    <div>
                      <p className="text-sm text-gray-500">Tổng tiền</p>
                      <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.orderStatus} displayName={order.orderStatusDisplayName} />
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        Chi tiết
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.orderItems.slice(0, 4).map((item: import("@/lib/store").OrderItem) => (
                      <div key={item.id} className="flex-shrink-0">
                        <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl text-gray-300">📚</div>
                          )}
                        </div>
                        <p className="text-xs text-center mt-1 font-medium line-clamp-1 w-16">{item.product.name}</p>
                        <p className="text-xs text-center text-gray-500">x{item.quantity}</p>
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
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
