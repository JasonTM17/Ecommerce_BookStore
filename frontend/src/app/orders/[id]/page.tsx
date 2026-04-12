"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore, type Order } from "@/lib/store";
import { buildLoginRedirect, cn, formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { icon: typeof Package; color: string; bgColor: string }> = {
  PENDING: { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  CONFIRMED: { icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-100" },
  PROCESSING: { icon: Package, color: "text-purple-600", bgColor: "bg-purple-100" },
  SHIPPED: { icon: Truck, color: "text-orange-600", bgColor: "bg-orange-100" },
  DELIVERED: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  REFUNDED: { icon: RotateCcw, color: "text-gray-600", bgColor: "bg-gray-100" },
};

function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function OrderStatusBadge({ order }: { order: Order }) {
  const config = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        config.bgColor,
        config.color
      )}
    >
      <Icon className="h-4 w-4" />
      {order.orderStatusDisplayName || order.orderStatus}
    </span>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const orderId = Number(params?.id);

  const {
    data: order,
    error,
    isLoading,
  } = useQuery<Order>({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: isAuthenticated && Number.isFinite(orderId),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(buildLoginRedirect(`/orders/${params?.id ?? ""}`));
    }
  }, [isAuthenticated, params?.id, router]);

  if (!isAuthenticated) {
    return null;
  }

  const statusCode = (error as AxiosError | undefined)?.response?.status;
  const showMissingState = statusCode === 403 || statusCode === 404;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/orders">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Button>
          </Link>
          <div>
            <p className="text-sm text-gray-500">Order detail</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {order?.orderNumber || `#${params?.id ?? ""}`}
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <Skeleton className="h-[420px] w-full rounded-2xl" />
              <Skeleton className="h-[420px] w-full rounded-2xl" />
            </div>
          </div>
        ) : showMissingState ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-20 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Order not found</h2>
            <p className="mx-auto mb-6 max-w-xl text-gray-500">
              The order may not exist anymore or does not belong to the current account.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/orders">
                <Button>View all orders</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Continue shopping</Button>
              </Link>
            </div>
          </div>
        ) : !order ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-8 py-20 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Unable to load this order</h2>
            <p className="mx-auto mb-6 max-w-xl text-gray-500">
              Please try again in a moment. If the problem keeps happening, contact support.
            </p>
            <Link href="/orders">
              <Button>Return to orders</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <section className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current status</p>
                    <div className="mt-2">
                      <OrderStatusBadge order={order} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Placed at</p>
                    <p className="font-medium text-gray-900">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Payment</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {order.paymentStatusDisplayName || order.paymentStatus}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{order.paymentMethod || "Not specified"}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Delivery</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {order.shippingMethod || "Standard shipping"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Delivered: {order.deliveredAt ? formatDateTime(order.deliveredAt) : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Total amount</p>
                    <p className="mt-1 text-xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</p>
                    <p className="mt-1 text-sm text-gray-500">Includes shipping and discounts</p>
                  </div>
                </div>
              </div>

              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Items in this order</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-28 w-24 overflow-hidden rounded-2xl bg-gray-100">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-gray-900">{item.product.name}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.product.author || item.product.publisher}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit price: {formatCurrency(item.price)}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                        >
                          View product
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Shipping information</h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{order.shippingReceiverName}</p>
                      <p>{order.shippingAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p>{order.shippingPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Payment method</p>
                      <p>{order.paymentMethod || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Summary</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping fee</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {order.notes ? (
                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900">Order notes</h2>
                  <p className="text-sm leading-6 text-gray-600">{order.notes}</p>
                </section>
              ) : null}
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
