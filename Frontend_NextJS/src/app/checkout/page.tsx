"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();

  const [shippingInfo, setShippingInfo] = useState({
    shippingAddress: "",
    shippingPhone: user?.phoneNumber || "",
    shippingReceiverName: user?.fullName || "",
    shippingMethod: "Giao hàng nhanh",
    paymentMethod: "COD",
    notes: "",
  });

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/orders", data);
      return response.data;
    },
    onSuccess: (data) => {
      setCart([], 0, 0);
      toast({
        title: "Đặt hàng thành công!",
        description: `Mã đơn hàng: ${data.orderNumber}`,
      });
      router.push(`/orders/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Đặt hàng thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      items: cart.items.map((item: any) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      ...shippingInfo,
    };

    orderMutation.mutate(orderData);
  };

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
            <Link href="/products">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shippingFee = cart.subtotal >= 200000 ? 0 : 25000;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/cart" className="text-gray-600 hover:text-primary">
              <ChevronLeft className="h-5 w-5 inline mr-1" />
              Quay lại giỏ hàng
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh Toán</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping & Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Thông Tin Giao Hàng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shippingReceiverName">Họ và tên người nhận</Label>
                      <Input
                        id="shippingReceiverName"
                        value={shippingInfo.shippingReceiverName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, shippingReceiverName: e.target.value })
                        }
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shippingPhone">Số điện thoại</Label>
                      <Input
                        id="shippingPhone"
                        value={shippingInfo.shippingPhone}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, shippingPhone: e.target.value })
                        }
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shippingAddress">Địa chỉ giao hàng</Label>
                      <Input
                        id="shippingAddress"
                        value={shippingInfo.shippingAddress}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, shippingAddress: e.target.value })
                        }
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                      <Input
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, notes: e.target.value })
                        }
                        placeholder="Ghi chú cho đơn hàng"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Phương Thức Thanh Toán
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={shippingInfo.paymentMethod === "COD"}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, paymentMethod: e.target.value })
                        }
                        className="text-primary"
                      />
                      <div>
                        <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-gray-500">Trả tiền mặt khi nhận được hàng</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={shippingInfo.paymentMethod === "VNPAY"}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, paymentMethod: e.target.value })
                        }
                        disabled
                        className="text-primary"
                      />
                      <div>
                        <p className="font-medium">VNPAY</p>
                        <p className="text-sm text-gray-500">Thanh toán qua ví VNPAY (sắp ra mắt)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="font-semibold text-gray-900 mb-4">Đơn Hàng Của Bạn</h2>

                  <div className="max-h-64 overflow-y-auto mb-4">
                    {cart.items.map((item: any) => (
                      <div key={item.id} className="flex gap-3 py-3 border-b last:border-b-0">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden relative">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl">📚</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                          <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                          <p className="text-sm font-medium text-primary">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính</span>
                      <span>{formatCurrency(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí giao hàng</span>
                      <span>{shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(cart.total + shippingFee)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={orderMutation.isPending}
                  >
                    {orderMutation.isPending ? "Đang xử lý..." : "Đặt Hàng"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Bằng cách đặt hàng, bạn đồng ý với{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Điều khoản sử dụng
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
