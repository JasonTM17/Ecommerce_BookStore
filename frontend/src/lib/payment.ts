import { api, apiPublic, type ApiResponse } from "./api";

export interface PaymentResponse {
  success: boolean;
  message?: string;
  orderId?: number;
  paymentUrl?: string;
  transactionId?: string;
  amount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderNumber?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface PaymentStatus {
  orderId: number;
  orderNumber?: string;
  paymentMethod?: string;
  paymentStatus: string;
  transactionId?: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  amount?: number;
  success?: boolean;
}

export const paymentApi = {
  async createVNPayPayment(orderId: number) {
    const response = await api.post<ApiResponse<PaymentResponse>>(
      "/payments/vnpay/create",
      {
        orderId,
      },
    );
    return response.data.data as PaymentResponse;
  },

  async confirmVNPayReturn(params: Record<string, string>) {
    const response = await apiPublic.get<ApiResponse<PaymentResponse>>(
      "/payments/vnpay/return",
      {
        params,
      },
    );
    return response.data.data as PaymentResponse;
  },

  async getPaymentStatus(orderId: number) {
    const response = await api.get<ApiResponse<PaymentStatus>>(
      `/payments/${orderId}/status`,
    );
    return response.data.data as PaymentStatus;
  },

  async requestRefund(orderId: number, reason: string) {
    const response = await api.post<ApiResponse<PaymentResponse>>(
      `/payments/${orderId}/refund`,
      {
        reason,
      },
    );
    return response.data.data as PaymentResponse;
  },
};
