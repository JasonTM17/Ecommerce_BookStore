package com.bookstore.entity;

public enum PaymentStatus {
    PENDING("Chờ thanh toán"),
    PROCESSING("Đang xử lý"),
    SUCCESS("Thành công"),
    FAILED("Thất bại"),
    CANCELLED("Đã hủy"),
    REFUNDED("Đã hoàn tiền"),
    PARTIALLY_REFUNDED("Hoàn tiền một phần");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
