"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuthStore, useCartStore, Address, CartItem } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Building2,
  CheckCircle,
  Package,
} from "lucide-react";

const PAYMENT_METHODS = [
  { id: "COD", name: "Thanh toán khi nhận hàng (COD)", icon: Package },
  { id: "VNPAY", name: "VNPay", icon: CreditCard },
  { id: "MOMO", name: "MoMo", icon: CreditCard },
  { id: "BANKING", name: "Chuyển khoản ngân hàng", icon: Building2 },
];

const SHIPPING_METHODS = [
  { id: "STANDARD", name: "Giao hàng tiêu chuẩn", desc: "3-5 ngày", price: 25000, free: false },
  { id: "EXPRESS", name: "Giao hàng nhanh", desc: "1-2 ngày", price: 40000, free: true },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, total, clearCart } = useCartStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    receiverName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
    notes: "",
  });

  // Fetch user addresses
  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await api.get("/addresses");
      return response.data as Address[];
    },
    enabled: isAuthenticated,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Record<string, unknown>) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: (data) => {
      setOrderSuccess(data.orderNumber);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setStep(4);
    },
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: Record<string, unknown>) => {
      const response = await api.post("/addresses", addressData);
      return response.data;
    },
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shippingMethod)!;
  const shippingFee = subtotal >= 200000 || selectedShipping.free ? 0 : selectedShipping.price;
  const estimatedTax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + shippingFee + estimatedTax;

  const handleSubmitOrder = async () => {
    if (!addressForm.receiverName || !addressForm.phoneNumber || !addressForm.province) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    const fullAddress = `${addressForm.streetAddress}, ${addressForm.ward}, ${addressForm.district}, ${addressForm.province}`;

    const orderData = {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddress: fullAddress,
      shippingPhone: addressForm.phoneNumber,
      shippingReceiverName: addressForm.receiverName,
      shippingMethod: selectedShipping.name,
      paymentMethod: paymentMethod,
      notes: addressForm.notes,
    };

    createOrderMutation.mutate(orderData);
  };

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ Hàng Trống</h1>
          <p className="text-gray-600 mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước</p>
          <Button onClick={() => router.push("/products")}>Khám Phá Sách</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt Hàng Thành Công!</h1>
            <p className="text-gray-600 mb-2">
              Cảm ơn bạn đã đặt hàng tại BookStore
            </p>
            <p className="text-lg font-semibold text-primary mb-8">
              Mã đơn hàng: {orderSuccess}
            </p>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Thông tin đơn hàng:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Chúng tôi đã gửi email xác nhận đơn hàng đến {user?.email}</p>
                <p>Bạn có thể theo dõi đơn hàng trong mục &quot;Đơn hàng của tôi&quot;</p>
                <p>Dự kiến giao hàng: 3-5 ngày làm việc</p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/orders")} variant="outline">
                Xem Đơn Hàng
              </Button>
              <Button onClick={() => router.push("/products")}>
                Tiếp Tục Mua Sắm
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Steps Header */}
        <div className="flex items-center justify-center mb-8">
          {["Thông Tin Giao Hàng", "Thanh Toán", "Xác Nhận"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  step > i + 1
                    ? "bg-primary text-white"
                    : step === i + 1
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`ml-2 font-medium ${
                  step >= i + 1 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {s}
              </span>
              {i < 2 && <div className="w-16 h-0.5 bg-gray-200 mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-primary" />
                  Thông Tin Giao Hàng
                </h2>

                {/* Saved Addresses */}
                {addresses && addresses.length > 0 && (
                  <div className="mb-6">
                    <Label className="mb-2 block">Địa chỉ đã lưu</Label>
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                            !useNewAddress && addr.isDefault
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={!useNewAddress && addr.isDefault}
                            onChange={() => setUseNewAddress(false)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{addr.receiverName}</p>
                            <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                            <p className="text-sm text-gray-500">{addr.fullAddress}</p>
                            {addr.isDefault && (
                              <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                      <label
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          useNewAddress ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={useNewAddress}
                          onChange={() => setUseNewAddress(true)}
                          className="mr-3"
                        />
                        <span className="font-medium">+ Thêm địa chỉ mới</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* New Address Form */}
                {useNewAddress && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiverName">Họ tên người nhận *</Label>
                        <Input
                          id="receiverName"
                          value={addressForm.receiverName}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, receiverName: e.target.value })
                          }
                          placeholder="Nhập họ tên"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                        <Input
                          id="phoneNumber"
                          value={addressForm.phoneNumber}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, phoneNumber: e.target.value })
                          }
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                        <Input
                          id="province"
                          value={addressForm.province}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, province: e.target.value })
                          }
                          placeholder="VD: TP. Hồ Chí Minh"
                        />
                      </div>
                      <div>
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          value={addressForm.district}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, district: e.target.value })
                          }
                          placeholder="VD: Quận 1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ward">Phường/Xã *</Label>
                        <Input
                          id="ward"
                          value={addressForm.ward}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, ward: e.target.value })
                          }
                          placeholder="VD: Phường Bến Nghé"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="streetAddress">Địa chỉ cụ thể *</Label>
                      <Input
                        id="streetAddress"
                        value={addressForm.streetAddress}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, streetAddress: e.target.value })
                        }
                        placeholder="VD: 123 Nguyễn Trãi, Phường 1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                      <Input
                        id="notes"
                        value={addressForm.notes}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, notes: e.target.value })
                        }
                        placeholder="VD: Giao giờ hành chính"
                      />
                    </div>
                  </div>
                )}

                {/* Shipping Method */}
                <div className="mt-6">
                  <Label className="mb-3 block">Phương thức vận chuyển</Label>
                  <div className="space-y-2">
                    {SHIPPING_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          shippingMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={() => setShippingMethod(method.id)}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.desc}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-primary">
                          {method.free || subtotal >= 200000 ? "Miễn phí" : formatCurrency(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={
                    useNewAddress &&
                    (!addressForm.receiverName || !addressForm.phoneNumber || !addressForm.province)
                  }
                >
                  Tiếp Tục Thanh Toán
                </Button>
              </div>
            )}

            {/* Payment */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-primary" />
                  Phương Thức Thanh Toán
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mr-4"
                      />
                      <method.icon className="w-5 h-5 mr-3 text-gray-600" />
                      <span className="font-medium">{method.name}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay Lại
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Xác Nhận Thông Tin
                  </Button>
                </div>
              </div>
            )}

            {/* Confirm */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Xác Nhận Đơn Hàng</h2>

                <div className="space-y-6">
                  {/* Shipping Info Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
                    <p className="text-gray-600">
                      {addressForm.receiverName} - {addressForm.phoneNumber}
                    </p>
                    <p className="text-gray-600">
                      {addressForm.streetAddress}, {addressForm.ward}, {addressForm.district},{" "}
                      {addressForm.province}
                    </p>
                    {addressForm.notes && <p className="text-gray-500 text-sm mt-1">Ghi chú: {addressForm.notes}</p>}
                  </div>

                  <Separator />

                  {/* Shipping Method Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Phương thức vận chuyển</h3>
                    <p className="text-gray-600">
                      {selectedShipping.name} ({selectedShipping.desc})
                    </p>
                  </div>

                  <Separator />

                  {/* Payment Method Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Phương thức thanh toán</h3>
                    <p className="text-gray-600">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                    </p>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Sản phẩm đặt hàng</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.product.imageUrl && (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                          </div>
                          <p className="font-semibold text-sm">{formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay Lại
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    className="flex-1"
                    size="lg"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Đang xử lý..." : "Đặt Hàng Ngay"}
                  </Button>
                </div>

                {createOrderMutation.isError && (
                  <p className="text-red-500 text-sm mt-4 text-center">
                    Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng Quan Đơn Hàng</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">
                    {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (VAT 10%)</span>
                  <span className="font-medium">{formatCurrency(estimatedTax)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
