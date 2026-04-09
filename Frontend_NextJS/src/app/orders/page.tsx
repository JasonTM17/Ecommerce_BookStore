"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order } from "@/lib/types";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/orders?page=0&size=10");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orders?.content || orders.content.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chưa có đơn hàng nào</h1>
            <p className="text-gray-600 mb-6">Hãy bắt đầu mua sắm để tạo đơn hàng</p>
            <Link href="/products">
              <Button>Mua Sắm Ngay</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Đơn Hàng Của Tôi</h1>

          <div className="space-y-4">
            {orders.content.map((order: Order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatusDisplayName}
                    </span>
                    <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      Chi tiết
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-sm text-gray-600">
                        {item.product?.name || "Sản phẩm"} x{item.quantity}
                      </span>
                    ))}
                    {order.orderItems.length > 3 && (
                      <span className="text-sm text-gray-500">
                        +{order.orderItems.length - 3} sản phẩm khác
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
