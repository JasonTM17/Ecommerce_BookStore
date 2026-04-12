import { api } from "./api";

export interface PaymentResponse {
  orderId: number;
  paymentUrl: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface PaymentStatus {
  orderId: number;
  status: string;
  paymentStatus: string;
  transactionId: string | null;
  paidAt: string | null;
}

export const paymentApi = {
  createVNPayPayment: async (orderId: number) => {
    const response = await api.post<{ data: PaymentResponse }>(
      "/payments/vnpay/create",
      { orderId }
    );
    return response.data.data;
  },

  getPaymentStatus: async (orderId: number) => {
    const response = await api.get<{ data: PaymentStatus }>(
      `/payments/${orderId}/status`
    );
    return response.data.data;
  },

  requestRefund: async (orderId: number, reason: string) => {
    const response = await api.post<{ data: any }>(`/payments/${orderId}/refund`, {
      reason,
    });
    return response.data.data;
  },
};
