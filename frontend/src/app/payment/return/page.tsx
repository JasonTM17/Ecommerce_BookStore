"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { paymentApi } from "@/lib/payment";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    loading: "Đang xác nhận thanh toán...",
    successTitle: "Thanh toán thành công",
    successDescription: "Đơn hàng của bạn đã được xác nhận qua VNPay.",
    failedTitle: "Thanh toán chưa hoàn tất",
    failedDescription:
      "Bạn có thể thử lại từ trang đơn hàng hoặc chọn thanh toán khi nhận hàng nếu cần.",
    statusLabel: "Trạng thái",
    transactionLabel: "Mã giao dịch",
    orderLabel: "Mã đơn hàng",
    amountLabel: "Số tiền",
    viewOrder: "Xem chi tiết đơn hàng",
    viewOrders: "Xem danh sách đơn hàng",
    backToHome: "Về trang chủ",
  },
  en: {
    loading: "Confirming your payment...",
    successTitle: "Payment successful",
    successDescription: "Your order has been confirmed through VNPay.",
    failedTitle: "Payment not completed",
    failedDescription:
      "You can retry from the order page or switch to cash on delivery if needed.",
    statusLabel: "Status",
    transactionLabel: "Transaction ID",
    orderLabel: "Order number",
    amountLabel: "Amount",
    viewOrder: "View order details",
    viewOrders: "View orders",
    backToHome: "Back to home",
  },
} as const;

function formatCurrency(amount?: number) {
  if (typeof amount !== "number") {
    return null;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentReturnPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = COPY[locale];

  const params = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    return Object.fromEntries(entries);
  }, [searchParams]);

  const paymentQuery = useQuery({
    queryKey: ["payment-return", params],
    queryFn: () => paymentApi.confirmVNPayReturn(params),
    enabled: Object.keys(params).length > 0,
    retry: false,
  });

  const payment = paymentQuery.data;
  const isSuccess = Boolean(payment?.success);
  const orderHref = payment?.orderId ? `/orders/${payment.orderId}` : "/orders";

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <Header />
      <main className="container mx-auto px-4 pb-24 pt-12 md:py-16">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#eadfce] bg-white p-6 shadow-[rgba(78,50,23,0.08)_0_18px_42px] md:p-8">
          {paymentQuery.isLoading ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-semibold text-gray-900">
                {copy.loading}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full ${
                    isSuccess
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-[#fff1e6] text-[#b42318]"
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="h-10 w-10" />
                  ) : (
                    <XCircle className="h-10 w-10" />
                  )}
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-[#1f1a17]">
                    {isSuccess ? copy.successTitle : copy.failedTitle}
                  </h1>
                  <p className="text-gray-600">
                    {isSuccess
                      ? copy.successDescription
                      : copy.failedDescription}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">{copy.statusLabel}</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {payment?.paymentStatus ||
                      paymentQuery.error instanceof Error
                        ? paymentQuery.error instanceof Error
                          ? paymentQuery.error.message
                          : payment?.paymentStatus
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{copy.orderLabel}</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {payment?.orderNumber || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{copy.transactionLabel}</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {payment?.transactionId || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{copy.amountLabel}</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(payment?.amount) || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1 rounded-full bg-[#1f1a17] font-semibold text-white hover:bg-[#3a2c25]"
                  onClick={() => router.push(orderHref)}
                >
                  {payment?.orderId ? copy.viewOrder : copy.viewOrders}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-[#e2c9ac] bg-white font-semibold text-[#1f1a17] hover:bg-[#fff8ed]"
                  >
                    {copy.backToHome}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
