"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore, useCartStore, type Address, type CartResponse, type Order } from "@/lib/store";
import { buildLoginRedirect, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CouponInput } from "@/components/coupon";
import type { Coupon } from "@/lib/coupon";
import { ArrowLeft, Building2, CheckCircle, CreditCard, Package, Tag, Truck } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    emptyTitle: "Giỏ hàng trống",
    emptyDescription: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.",
    browseProducts: "Khám phá sách",
    loadingCart: "Đang tải giỏ hàng...",
    successTitle: "Đặt hàng thành công!",
    successDescription: "Cảm ơn bạn đã mua sắm tại BookStore.",
    orderNumber: "Mã đơn hàng",
    successInfo: "Thông tin đơn hàng",
    successEmail: (email?: string) => `Chúng tôi đã gửi email xác nhận đến ${email || "tài khoản của bạn"}.`,
    successOrders: 'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi".',
    successETA: "Dự kiến giao hàng: 3-5 ngày làm việc",
    viewOrders: "Xem đơn hàng",
    continueShopping: "Tiếp tục mua sắm",
    steps: ["Thông tin giao hàng", "Thanh toán", "Xác nhận"],
    shippingInfo: "Thông tin giao hàng",
    savedAddresses: "Địa chỉ đã lưu",
    addNewAddress: "Thêm địa chỉ mới",
    fullName: "Họ tên người nhận *",
    phone: "Số điện thoại *",
    province: "Tỉnh / Thành phố *",
    district: "Quận / Huyện *",
    ward: "Phường / Xã *",
    street: "Địa chỉ cụ thể *",
    notes: "Ghi chú",
    shippingMethod: "Phương thức vận chuyển",
    nextPayment: "Tiếp tục thanh toán",
    paymentMethod: "Phương thức thanh toán",
    back: "Quay lại",
    confirmInfo: "Xác nhận thông tin",
    confirmOrder: "Xác nhận đơn hàng",
    shippingSummary: "Địa chỉ giao hàng",
    paymentSummary: "Phương thức thanh toán",
    orderItems: "Sản phẩm đặt hàng",
    orderSummary: "Tổng quan đơn hàng",
    subtotal: "Tạm tính",
    shipping: "Phí vận chuyển",
    freeShipping: "Miễn phí",
    tax: "Thuế (VAT 10%)",
    total: "Tổng cộng",
    orderNow: "Đặt hàng ngay",
    processing: "Đang xử lý...",
    orderError: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.",
    addressError: "Vui lòng điền đầy đủ thông tin giao hàng.",
    savedAddressError: "Vui lòng chọn một địa chỉ đã lưu.",
    couponCode: "Mã",
    defaultAddress: "Mặc định",
  },
  en: {
    emptyTitle: "Your cart is empty",
    emptyDescription: "Please add items to your cart before placing an order.",
    browseProducts: "Browse books",
    loadingCart: "Loading your cart...",
    successTitle: "Order placed successfully!",
    successDescription: "Thank you for shopping at BookStore.",
    orderNumber: "Order number",
    successInfo: "Order information",
    successEmail: (email?: string) => `We sent the order confirmation to ${email || "your account"}.`,
    successOrders: 'You can track this order in "My Orders".',
    successETA: "Estimated delivery: 3-5 business days",
    viewOrders: "View orders",
    continueShopping: "Continue shopping",
    steps: ["Shipping information", "Payment", "Confirmation"],
    shippingInfo: "Shipping information",
    savedAddresses: "Saved addresses",
    addNewAddress: "Add new address",
    fullName: "Receiver full name *",
    phone: "Phone number *",
    province: "Province / City *",
    district: "District *",
    ward: "Ward *",
    street: "Street address *",
    notes: "Notes",
    shippingMethod: "Shipping method",
    nextPayment: "Continue to payment",
    paymentMethod: "Payment method",
    back: "Back",
    confirmInfo: "Confirm information",
    confirmOrder: "Confirm order",
    shippingSummary: "Shipping address",
    paymentSummary: "Payment method",
    orderItems: "Order items",
    orderSummary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Shipping fee",
    freeShipping: "Free",
    tax: "Tax (VAT 10%)",
    total: "Total",
    orderNow: "Place order",
    processing: "Processing...",
    orderError: "Something went wrong while placing the order. Please try again.",
    addressError: "Please complete all shipping information.",
    savedAddressError: "Please choose one of your saved addresses.",
    couponCode: "Code",
    defaultAddress: "Default",
  },
} as const;

const PAYMENT_METHODS = [
  { id: "COD", name: { vi: "Thanh toán khi nhận hàng (COD)", en: "Cash on delivery (COD)" }, icon: Package },
  { id: "VNPAY", name: { vi: "VNPay", en: "VNPay" }, icon: CreditCard },
  { id: "MOMO", name: { vi: "MoMo", en: "MoMo" }, icon: CreditCard },
  { id: "BANKING", name: { vi: "Chuyển khoản ngân hàng", en: "Bank transfer" }, icon: Building2 },
] as const;

const SHIPPING_METHODS = [
  { id: "STANDARD", name: { vi: "Giao hàng tiêu chuẩn", en: "Standard shipping" }, desc: { vi: "3-5 ngày", en: "3-5 days" }, price: 25000, free: false },
  { id: "EXPRESS", name: { vi: "Giao hàng nhanh", en: "Express shipping" }, desc: { vi: "1-2 ngày", en: "1-2 days" }, price: 40000, free: true },
] as const;

type AddressFormState = { receiverName: string; phoneNumber: string; province: string; district: string; ward: string; streetAddress: string; notes: string };

function buildFullAddress(addressForm: AddressFormState) {
  return [addressForm.streetAddress.trim(), addressForm.ward.trim(), addressForm.district.trim(), addressForm.province.trim()].filter(Boolean).join(", ");
}

export default function CheckoutPage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { items, clearCart, setCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [addressForm, setAddressForm] = useState<AddressFormState>({ receiverName: user?.fullName || "", phoneNumber: user?.phoneNumber || "", province: "", district: "", ward: "", streetAddress: "", notes: "" });

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get("/addresses")).data as Address[],
    enabled: isAuthenticated,
  });

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data as CartResponse,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(buildLoginRedirect("/checkout"));
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId == null) {
      setSelectedAddressId((addresses.find((address) => address.isDefault) ?? addresses[0]).id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (cartData) {
      setCart(cartData.items, cartData.totalItems, cartData.total);
    }
  }, [cartData, setCart]);

  const selectedSavedAddress = useMemo(() => addresses.find((address) => address.id === selectedAddressId) ?? null, [addresses, selectedAddressId]);
  const selectedShipping = SHIPPING_METHODS.find((method) => method.id === shippingMethod) ?? SHIPPING_METHODS[0];
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = subtotal >= 200000 || selectedShipping.free ? 0 : selectedShipping.price;
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.1);
  const grandTotal = subtotal + shippingFee + estimatedTax - discountAmount;
  const isNewAddressComplete = [addressForm.receiverName, addressForm.phoneNumber, addressForm.province, addressForm.district, addressForm.ward, addressForm.streetAddress].every((value) => value.trim().length > 0);
  const checkoutAddress = useMemo(() => {
    if (useNewAddress) {
      return isNewAddressComplete ? { receiverName: addressForm.receiverName.trim(), phoneNumber: addressForm.phoneNumber.trim(), fullAddress: buildFullAddress(addressForm), notes: addressForm.notes.trim() } : null;
    }
    return selectedSavedAddress ? { receiverName: selectedSavedAddress.receiverName, phoneNumber: selectedSavedAddress.phoneNumber, fullAddress: selectedSavedAddress.fullAddress, notes: addressForm.notes.trim() } : null;
  }, [addressForm, isNewAddressComplete, selectedSavedAddress, useNewAddress]);

  const createOrderMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/orders", payload)).data as Order,
    onSuccess: (order) => {
      setOrderSuccess(order);
      setOrderErrorMessage(null);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStep(4);
    },
    onError: (error) => {
      const message = isAxiosError(error) ? (error.response?.data as { message?: string; error?: string } | undefined)?.message || (error.response?.data as { message?: string; error?: string } | undefined)?.error || copy.orderError : copy.orderError;
      setOrderErrorMessage(message);
      toast.error(message);
    },
  });

  function validateAddressStep() {
    if (useNewAddress && !isNewAddressComplete) {
      toast.error(copy.addressError);
      return false;
    }
    if (!useNewAddress && !selectedSavedAddress) {
      toast.error(copy.savedAddressError);
      return false;
    }
    return true;
  }

  function handleSubmitOrder() {
    if (!checkoutAddress) {
      toast.error(useNewAddress ? copy.addressError : copy.savedAddressError);
      return;
    }
    setOrderErrorMessage(null);
    createOrderMutation.mutate({
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      shippingAddress: checkoutAddress.fullAddress,
      shippingPhone: checkoutAddress.phoneNumber,
      shippingReceiverName: checkoutAddress.receiverName,
      shippingMethod: selectedShipping.name[locale],
      paymentMethod,
      notes: checkoutAddress.notes || undefined,
      couponCode: appliedCoupon?.code,
    });
  }

  if (!isAuthenticated) return null;

  if (isCartLoading && items.length === 0 && !orderSuccess) {
    return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 container mx-auto px-4 py-16 text-center"><h1 className="text-2xl font-bold text-gray-900">{copy.loadingCart}</h1></main><Footer /></div>;
  }

  if (items.length === 0 && !orderSuccess) {
    return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 container mx-auto px-4 py-16 text-center"><h1 className="mb-4 text-2xl font-bold text-gray-900">{copy.emptyTitle}</h1><p className="mb-8 text-gray-600">{copy.emptyDescription}</p><Button onClick={() => router.push("/products")}>{copy.browseProducts}</Button></main><Footer /></div>;
  }

  if (orderSuccess) {
    return <div className="min-h-screen flex flex-col bg-gray-50"><Header /><main className="flex-1 container mx-auto px-4 py-16"><div className="mx-auto max-w-2xl text-center"><div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><CheckCircle className="h-10 w-10 text-green-600" /></div><h1 className="mb-4 text-3xl font-bold text-gray-900">{copy.successTitle}</h1><p className="mb-2 text-gray-600">{copy.successDescription}</p><p className="mb-8 text-lg font-semibold text-primary">{copy.orderNumber}: {orderSuccess.orderNumber}</p><div className="mb-8 rounded-lg bg-white p-6 text-left shadow-sm"><h3 className="mb-4 font-semibold">{copy.successInfo}</h3><div className="space-y-2 text-sm text-gray-600"><p>{copy.successEmail(user?.email)}</p><p>{copy.successOrders}</p><p>{copy.successETA}</p></div></div><div className="flex justify-center gap-4"><Button onClick={() => router.push("/orders")} variant="outline">{copy.viewOrders}</Button><Button onClick={() => router.push("/products")}>{copy.continueShopping}</Button></div></div></main><Footer /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-center">{copy.steps.map((label, index) => <div key={label} className="flex items-center"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step >= index + 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>{step > index + 1 ? <CheckCircle className="h-5 w-5" /> : index + 1}</div><span className={`ml-2 font-medium ${step >= index + 1 ? "text-gray-900" : "text-gray-400"}`}>{label}</span>{index < 2 ? <div className="mx-4 h-0.5 w-16 bg-gray-200" /> : null}</div>)}</div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {step === 1 ? <div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="mb-6 flex items-center text-xl font-bold text-gray-900"><Truck className="mr-2 h-5 w-5 text-primary" />{copy.shippingInfo}</h2>
              {addresses.length > 0 ? <div className="mb-6"><Label className="mb-2 block">{copy.savedAddresses}</Label><div className="space-y-2">{addresses.map((address) => { const isSelected = !useNewAddress && selectedAddressId === address.id; return <label key={address.id} className={`flex cursor-pointer items-start rounded-lg border p-4 transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}><input type="radio" name="address" checked={isSelected} onChange={() => { setUseNewAddress(false); setSelectedAddressId(address.id); }} className="mr-3 mt-1" /><div className="flex-1"><p className="font-medium">{address.receiverName}</p><p className="text-sm text-gray-600">{address.phoneNumber}</p><p className="text-sm text-gray-500">{address.fullAddress}</p>{address.isDefault ? <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{copy.defaultAddress}</span> : null}</div></label>; })}<label className={`flex cursor-pointer items-center rounded-lg border p-4 transition-colors ${useNewAddress ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}><input type="radio" name="address" checked={useNewAddress} onChange={() => setUseNewAddress(true)} className="mr-3" /><span className="font-medium">{copy.addNewAddress}</span></label></div></div> : null}
              {useNewAddress ? <div className="space-y-4"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><Label htmlFor="receiverName">{copy.fullName}</Label><Input id="receiverName" value={addressForm.receiverName} onChange={(event) => setAddressForm((current) => ({ ...current, receiverName: event.target.value }))} /></div><div><Label htmlFor="phoneNumber">{copy.phone}</Label><Input id="phoneNumber" value={addressForm.phoneNumber} onChange={(event) => setAddressForm((current) => ({ ...current, phoneNumber: event.target.value }))} /></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><div><Label htmlFor="province">{copy.province}</Label><Input id="province" value={addressForm.province} onChange={(event) => setAddressForm((current) => ({ ...current, province: event.target.value }))} /></div><div><Label htmlFor="district">{copy.district}</Label><Input id="district" value={addressForm.district} onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))} /></div><div><Label htmlFor="ward">{copy.ward}</Label><Input id="ward" value={addressForm.ward} onChange={(event) => setAddressForm((current) => ({ ...current, ward: event.target.value }))} /></div></div><div><Label htmlFor="streetAddress">{copy.street}</Label><Input id="streetAddress" value={addressForm.streetAddress} onChange={(event) => setAddressForm((current) => ({ ...current, streetAddress: event.target.value }))} /></div></div> : null}
              <div className="mt-4"><Label htmlFor="notes">{copy.notes}</Label><Input id="notes" value={addressForm.notes} onChange={(event) => setAddressForm((current) => ({ ...current, notes: event.target.value }))} /></div>
              <div className="mt-6"><Label className="mb-3 block">{copy.shippingMethod}</Label><div className="space-y-2">{SHIPPING_METHODS.map((method) => <label key={method.id} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${shippingMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}><div className="flex items-center"><input type="radio" name="shipping" value={method.id} checked={shippingMethod === method.id} onChange={() => setShippingMethod(method.id)} className="mr-3" /><div><p className="font-medium">{method.name[locale]}</p><p className="text-sm text-gray-500">{method.desc[locale]}</p></div></div><span className="font-semibold text-primary">{method.free || subtotal >= 200000 ? copy.freeShipping : formatCurrency(method.price)}</span></label>)}</div></div>
              <Button className="mt-6 w-full" size="lg" onClick={() => { if (!validateAddressStep()) return; setStep(2); }} disabled={useNewAddress ? !isNewAddressComplete : !selectedSavedAddress}>{copy.nextPayment}</Button>
            </div> : null}
            {step === 2 ? <div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="mb-6 flex items-center text-xl font-bold text-gray-900"><CreditCard className="mr-2 h-5 w-5 text-primary" />{copy.paymentMethod}</h2><div className="space-y-3">{PAYMENT_METHODS.map((method) => <label key={method.id} className={`flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}><input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="mr-4" /><method.icon className="mr-3 h-5 w-5 text-gray-600" /><span className="font-medium">{method.name[locale]}</span></label>)}</div><div className="mt-6 flex gap-4"><Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" />{copy.back}</Button><Button onClick={() => setStep(3)} className="flex-1">{copy.confirmInfo}</Button></div></div> : null}
            {step === 3 ? <div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="mb-6 text-xl font-bold text-gray-900">{copy.confirmOrder}</h2><div className="space-y-6"><div><h3 className="mb-2 font-semibold">{copy.shippingSummary}</h3><p className="text-gray-600">{checkoutAddress?.receiverName} - {checkoutAddress?.phoneNumber}</p><p className="text-gray-600">{checkoutAddress?.fullAddress}</p>{checkoutAddress?.notes ? <p className="mt-1 text-sm text-gray-500">{copy.notes}: {checkoutAddress.notes}</p> : null}</div><Separator /><div><h3 className="mb-2 font-semibold">{copy.shippingMethod}</h3><p className="text-gray-600">{selectedShipping.name[locale]} ({selectedShipping.desc[locale]})</p></div><Separator /><div><h3 className="mb-2 font-semibold">{copy.paymentSummary}</h3><p className="text-gray-600">{PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.name[locale]}</p></div><Separator /><div><h3 className="mb-3 font-semibold">{copy.orderItems}</h3><div className="space-y-3">{items.map((item) => <div key={item.id} className="flex items-center gap-4"><div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">{item.product.imageUrl ? <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" /> : null}</div><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-medium">{item.product.name}</p><p className="text-sm text-gray-500">x{item.quantity}</p></div><p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p></div>)}</div></div></div><div className="mt-6 flex gap-4"><Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" />{copy.back}</Button><Button onClick={handleSubmitOrder} className="flex-1" size="lg" disabled={createOrderMutation.isPending || !checkoutAddress}>{createOrderMutation.isPending ? copy.processing : copy.orderNow}</Button></div>{orderErrorMessage ? <p className="mt-4 text-center text-sm text-red-500">{orderErrorMessage}</p> : null}</div> : null}
          </div>
          <div className="lg:col-span-1"><div className="sticky top-24 rounded-lg bg-white p-6 shadow-sm"><h2 className="mb-6 text-xl font-bold text-gray-900">{copy.orderSummary}</h2><div className="mb-6 space-y-3">{items.map((item) => <div key={item.id} className="flex items-center gap-3"><div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">{item.product.imageUrl ? <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" /> : null}</div><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-medium">{item.product.name}</p><p className="text-xs text-gray-500">x{item.quantity}</p></div><p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p></div>)}</div><Separator className="my-4" /><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-600">{copy.subtotal}</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>{appliedCoupon ? <div className="flex justify-between text-green-600"><span className="flex items-center gap-1"><Tag className="h-3 w-3" />{copy.couponCode} {appliedCoupon.code}</span><span className="font-medium">-{formatCurrency(discountAmount)}</span></div> : null}<div className="flex justify-between"><span className="text-gray-600">{copy.shipping}</span><span className="font-medium text-green-600">{shippingFee === 0 ? copy.freeShipping : formatCurrency(shippingFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">{copy.tax}</span><span className="font-medium">{formatCurrency(estimatedTax)}</span></div></div><Separator className="my-4" /><div className="mb-4"><CouponInput orderTotal={subtotal} onApply={(coupon, discount) => { setAppliedCoupon(coupon); setDiscountAmount(discount); }} /></div><div className="flex justify-between text-lg font-bold"><span>{copy.total}</span><span className="text-primary">{formatCurrency(grandTotal)}</span></div></div></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
