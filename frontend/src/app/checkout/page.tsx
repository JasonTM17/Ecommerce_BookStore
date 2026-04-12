"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuthStore, useCartStore, Address } from "@/lib/store";
import { formatCurrency, buildLoginRedirect } from "@/lib/utils";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CouponInput } from "@/components/coupon";
import { Coupon } from "@/lib/coupon";
import { Tag, ArrowLeft, Truck, CreditCard, Building2, CheckCircle, Package } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    loadingRedirect: "Đang chuyển đến trang đăng nhập...",
    emptyTitle: "Giỏ Hàng Trống",
    emptyDescription: "Vui lòng thêm sản phẩm vào giỏ hàng trước",
    browseProducts: "Khám Phá Sách",
    successTitle: "Đặt Hàng Thành Công!",
    successDescription: "Cảm ơn bạn đã đặt hàng tại BookStore",
    orderNumber: "Mã đơn hàng",
    successInfo: "Thông tin đơn hàng:",
    successEmail: (email?: string) => `Chúng tôi đã gửi email xác nhận đơn hàng đến ${email || "tài khoản của bạn"}`,
    successOrders: "Bạn có thể theo dõi đơn hàng trong mục \"Đơn hàng của tôi\"",
    successETA: "Dự kiến giao hàng: 3-5 ngày làm việc",
    viewOrders: "Xem Đơn Hàng",
    continueShopping: "Tiếp Tục Mua Sắm",
    steps: ["Thông Tin Giao Hàng", "Thanh Toán", "Xác Nhận"],
    shippingInfo: "Thông Tin Giao Hàng",
    savedAddresses: "Địa chỉ đã lưu",
    addNewAddress: "+ Thêm địa chỉ mới",
    fullName: "Họ tên người nhận *",
    phone: "Số điện thoại *",
    province: "Tỉnh/Thành phố *",
    district: "Quận/Huyện *",
    ward: "Phường/Xã *",
    street: "Địa chỉ cụ thể *",
    notes: "Ghi chú (tùy chọn)",
    shippingMethod: "Phương thức vận chuyển",
    nextPayment: "Tiếp Tục Thanh Toán",
    paymentMethod: "Phương Thức Thanh Toán",
    back: "Quay Lại",
    confirmInfo: "Xác Nhận Thông Tin",
    confirmOrder: "Xác Nhận Đơn Hàng",
    shippingSummary: "Địa chỉ giao hàng",
    paymentSummary: "Phương thức thanh toán",
    orderItems: "Sản phẩm đặt hàng",
    orderSummary: "Tổng Quan Đơn Hàng",
    subtotal: "Tạm tính",
    shipping: "Phí vận chuyển",
    freeShipping: "Miễn phí",
    tax: "Thuế (VAT 10%)",
    total: "Tổng cộng",
    orderNow: "Đặt Hàng Ngay",
    processing: "Đang xử lý...",
    orderError: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.",
    addressError: "Vui lòng điền đầy đủ thông tin giao hàng",
    addressSaveError: "Lưu địa chỉ thất bại",
    couponCode: "Mã",
  },
  en: {
    loadingRedirect: "Redirecting to sign in...",
    emptyTitle: "Your Cart Is Empty",
    emptyDescription: "Please add products to your cart first",
    browseProducts: "Browse books",
    successTitle: "Order Placed Successfully!",
    successDescription: "Thank you for shopping at BookStore",
    orderNumber: "Order number",
    successInfo: "Order information:",
    successEmail: (email?: string) => `We sent the order confirmation to ${email || "your account"}`,
    successOrders: 'You can track this order in "My Orders"',
    successETA: "Estimated delivery: 3-5 business days",
    viewOrders: "View Orders",
    continueShopping: "Continue Shopping",
    steps: ["Shipping Information", "Payment", "Confirmation"],
    shippingInfo: "Shipping Information",
    savedAddresses: "Saved addresses",
    addNewAddress: "+ Add new address",
    fullName: "Receiver full name *",
    phone: "Phone number *",
    province: "Province / City *",
    district: "District *",
    ward: "Ward *",
    street: "Street address *",
    notes: "Notes (optional)",
    shippingMethod: "Shipping method",
    nextPayment: "Continue to payment",
    paymentMethod: "Payment method",
    back: "Back",
    confirmInfo: "Confirm information",
    confirmOrder: "Confirm order",
    shippingSummary: "Shipping address",
    paymentSummary: "Payment method",
    orderItems: "Order items",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping fee",
    freeShipping: "Free",
    tax: "Tax (VAT 10%)",
    total: "Total",
    orderNow: "Place order",
    processing: "Processing...",
    orderError: "Something went wrong while placing the order. Please try again.",
    addressError: "Please complete all shipping information",
    addressSaveError: "Failed to save address",
    couponCode: "Code",
  },
} as const;

const PAYMENT_METHODS = [
  { id: "COD", name: { vi: "Thanh toán khi nhận hàng (COD)", en: "Cash on delivery (COD)" }, icon: Package },
  { id: "VNPAY", name: { vi: "VNPay", en: "VNPay" }, icon: CreditCard },
  { id: "MOMO", name: { vi: "MoMo", en: "MoMo" }, icon: CreditCard },
  { id: "BANKING", name: { vi: "Chuyển khoản ngân hàng", en: "Bank transfer" }, icon: Building2 },
] as const;

const SHIPPING_METHODS = [
  {
    id: "STANDARD",
    name: { vi: "Giao hàng tiêu chuẩn", en: "Standard shipping" },
    desc: { vi: "3-5 ngày", en: "3-5 days" },
    price: 25000,
    free: false,
  },
  {
    id: "EXPRESS",
    name: { vi: "Giao hàng nhanh", en: "Express shipping" },
    desc: { vi: "1-2 ngày", en: "1-2 days" },
    price: 40000,
    free: true,
  },
] as const;

export default function CheckoutPage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [addressForm, setAddressForm] = useState({
    receiverName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
    notes: "",
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await api.get("/addresses");
      return response.data as Address[];
    },
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Record<string, unknown>) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: (data) => {
      setOrderSuccess((data as { orderNumber: string }).orderNumber);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setStep(4);
    },
    onError: () => {
      toast.error(copy.orderError);
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(buildLoginRedirect("/checkout"));
    }
  }, [isAuthenticated, router]);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shippingMethod)!;
  const shippingFee = subtotal >= 200000 || selectedShipping.free ? 0 : selectedShipping.price;
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.1);
  const grandTotal = subtotal + shippingFee + estimatedTax - discountAmount;

  const handleSubmitOrder = () => {
    if (!addressForm.receiverName || !addressForm.phoneNumber || !addressForm.province) {
      toast.error(copy.addressError);
      return;
    }

    const fullAddress = `${addressForm.streetAddress}, ${addressForm.ward}, ${addressForm.district}, ${addressForm.province}`;

    createOrderMutation.mutate({
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddress: fullAddress,
      shippingPhone: addressForm.phoneNumber,
      shippingReceiverName: addressForm.receiverName,
      shippingMethod: selectedShipping.name[locale],
      paymentMethod,
      notes: addressForm.notes,
      couponCode: appliedCoupon?.code,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{copy.emptyTitle}</h1>
          <p className="mb-8 text-gray-600">{copy.emptyDescription}</p>
          <Button onClick={() => router.push("/products")}>{copy.browseProducts}</Button>
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
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">{copy.successTitle}</h1>
            <p className="mb-2 text-gray-600">{copy.successDescription}</p>
            <p className="mb-8 text-lg font-semibold text-primary">
              {copy.orderNumber}: {orderSuccess}
            </p>
            <div className="mb-8 rounded-lg bg-white p-6 text-left shadow-sm">
              <h3 className="mb-4 font-semibold">{copy.successInfo}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{copy.successEmail(user?.email)}</p>
                <p>{copy.successOrders}</p>
                <p>{copy.successETA}</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/orders")} variant="outline">
                {copy.viewOrders}
              </Button>
              <Button onClick={() => router.push("/products")}>{copy.continueShopping}</Button>
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
        <div className="mb-8 flex items-center justify-center">
          {copy.steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step > i + 1 ? "bg-primary text-white" : step === i + 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > i + 1 ? <CheckCircle className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`ml-2 font-medium ${step >= i + 1 ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
              {i < 2 && <div className="mx-4 h-0.5 w-16 bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {step === 1 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
                  <Truck className="mr-2 h-5 w-5 text-primary" />
                  {copy.shippingInfo}
                </h2>

                {addresses && addresses.length > 0 && (
                  <div className="mb-6">
                    <Label className="mb-2 block">{copy.savedAddresses}</Label>
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex cursor-pointer items-start rounded-lg border p-4 transition-colors ${
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
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{addr.receiverName}</p>
                            <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                            <p className="text-sm text-gray-500">{addr.fullAddress}</p>
                            {addr.isDefault && (
                              <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                Mặc định
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                      <label
                        className={`flex cursor-pointer items-center rounded-lg border p-4 transition-colors ${
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
                        <span className="font-medium">{copy.addNewAddress}</span>
                      </label>
                    </div>
                  </div>
                )}

                {useNewAddress && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiverName">{copy.fullName}</Label>
                        <Input id="receiverName" value={addressForm.receiverName} onChange={(e) => setAddressForm({ ...addressForm, receiverName: e.target.value })} placeholder={locale === "vi" ? "Nhập họ tên" : "Enter full name"} />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">{copy.phone}</Label>
                        <Input id="phoneNumber" value={addressForm.phoneNumber} onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} placeholder={locale === "vi" ? "Nhập số điện thoại" : "Enter phone number"} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="province">{copy.province}</Label>
                        <Input id="province" value={addressForm.province} onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })} placeholder={locale === "vi" ? "VD: TP. Hồ Chí Minh" : "e.g. Ho Chi Minh City"} />
                      </div>
                      <div>
                        <Label htmlFor="district">{copy.district}</Label>
                        <Input id="district" value={addressForm.district} onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })} placeholder={locale === "vi" ? "VD: Quận 1" : "e.g. District 1"} />
                      </div>
                      <div>
                        <Label htmlFor="ward">{copy.ward}</Label>
                        <Input id="ward" value={addressForm.ward} onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })} placeholder={locale === "vi" ? "VD: Phường Bến Nghé" : "e.g. Ben Nghe Ward"} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="streetAddress">{copy.street}</Label>
                      <Input id="streetAddress" value={addressForm.streetAddress} onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })} placeholder={locale === "vi" ? "VD: 123 Nguyễn Trãi, Phường 1" : "e.g. 123 Nguyen Trai, Ward 1"} />
                    </div>

                    <div>
                      <Label htmlFor="notes">{copy.notes}</Label>
                      <Input id="notes" value={addressForm.notes} onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })} placeholder={locale === "vi" ? "VD: Giao giờ hành chính" : "e.g. Deliver during business hours"} />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Label className="mb-3 block">{copy.shippingMethod}</Label>
                  <div className="space-y-2">
                    {SHIPPING_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                          shippingMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
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
                            <p className="font-medium">{method.name[locale]}</p>
                            <p className="text-sm text-gray-500">{method.desc[locale]}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-primary">
                          {method.free || subtotal >= 200000 ? copy.freeShipping : formatCurrency(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={useNewAddress && (!addressForm.receiverName || !addressForm.phoneNumber || !addressForm.province)}
                >
                  {copy.nextPayment}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                  {copy.paymentMethod}
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center rounded-lg border p-4 transition-colors ${
                        paymentMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
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
                      <method.icon className="mr-3 h-5 w-5 text-gray-600" />
                      <span className="font-medium">{method.name[locale]}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {copy.back}
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    {copy.confirmInfo}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">{copy.confirmOrder}</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-semibold">{copy.shippingSummary}</h3>
                    <p className="text-gray-600">
                      {addressForm.receiverName} - {addressForm.phoneNumber}
                    </p>
                    <p className="text-gray-600">
                      {addressForm.streetAddress}, {addressForm.ward}, {addressForm.district}, {addressForm.province}
                    </p>
                    {addressForm.notes && <p className="mt-1 text-sm text-gray-500">{copy.notes}: {addressForm.notes}</p>}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 font-semibold">{copy.shippingMethod}</h3>
                    <p className="text-gray-600">
                      {selectedShipping.name[locale]} ({selectedShipping.desc[locale]})
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 font-semibold">{copy.paymentSummary}</h3>
                    <p className="text-gray-600">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name[locale]}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3 font-semibold">{copy.orderItems}</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                            {item.product.imageUrl && (
                              <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {copy.back}
                  </Button>
                  <Button onClick={handleSubmitOrder} className="flex-1" size="lg" disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending ? copy.processing : copy.orderNow}
                  </Button>
                </div>

                {createOrderMutation.isError && (
                  <p className="mt-4 text-center text-sm text-red-500">{copy.orderError}</p>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">{copy.orderSummary}</h2>

              <div className="mb-6 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      {item.product.imageUrl && (
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{copy.subtotal}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {copy.couponCode} {appliedCoupon.code}
                    </span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{copy.shipping}</span>
                  <span className="font-medium text-green-600">
                    {shippingFee === 0 ? copy.freeShipping : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{copy.tax}</span>
                  <span className="font-medium">{formatCurrency(estimatedTax)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="mb-4">
                <CouponInput
                  orderTotal={subtotal}
                  onApply={(coupon, discount) => {
                    setAppliedCoupon(coupon);
                    setDiscountAmount(discount);
                  }}
                />
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>{copy.total}</span>
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
