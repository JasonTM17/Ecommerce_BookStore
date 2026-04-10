import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CouponInput } from "@/components/coupon/CouponInput";
import type { Coupon } from "@/lib/coupon";

const mockCoupon: Coupon = {
  id: 1,
  code: "SAVE20",
  description: "Save 20% on your order",
  type: "PERCENTAGE",
  discountValue: 20,
  maxDiscount: 50000,
  minOrderAmount: 100000,
  usageLimit: 100,
  usedCount: 0,
  startDate: "2024-01-01",
  endDate: "2025-12-31",
  isActive: true,
};

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/coupon", () => ({
  couponApi: {
    validateCoupon: vi.fn(),
  },
}));

describe("CouponInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders coupon input field", () => {
    render(<CouponInput />);
    expect(screen.getByPlaceholderText("Nhập mã coupon")).toBeInTheDocument();
  });

  it("renders apply button", () => {
    render(<CouponInput />);
    expect(screen.getByText("Áp dụng")).toBeInTheDocument();
  });

  it("updates code state on input change", async () => {
    const user = userEvent.setup();
    render(<CouponInput />);

    const input = screen.getByPlaceholderText("Nhập mã coupon");
    await user.type(input, "save20");

    expect(input).toHaveValue("SAVE20");
  });

  it("disables apply button when code is empty", () => {
    render(<CouponInput />);
    expect(screen.getByText("Áp dụng")).toBeDisabled();
  });

  it("enables apply button when code is entered", async () => {
    const user = userEvent.setup();
    render(<CouponInput />);

    const input = screen.getByPlaceholderText("Nhập mã coupon");
    await user.type(input, "SAVE20");

    expect(screen.getByText("Áp dụng")).not.toBeDisabled();
  });

  it("calls onApply with correct discount when coupon is PERCENTAGE", async () => {
    const { couponApi } = await import("@/lib/coupon");
    const onApply = vi.fn();

    (couponApi.validateCoupon as ReturnType<typeof vi.fn>).mockResolvedValue(mockCoupon);

    render(<CouponInput orderTotal={200000} onApply={onApply} />);

    const input = screen.getByPlaceholderText("Nhập mã coupon");
    const user = userEvent.setup();
    await user.type(input, "SAVE20");

    const applyButton = screen.getByText("Áp dụng");
    await user.click(applyButton);

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(mockCoupon, 40000);
    });
  });

  it("caps percentage discount at maxDiscount", async () => {
    const { couponApi } = await import("@/lib/coupon");
    const onApply = vi.fn();

    (couponApi.validateCoupon as ReturnType<typeof vi.fn>).mockResolvedValue(mockCoupon);

    render(<CouponInput orderTotal={500000} onApply={onApply} />);

    const input = screen.getByPlaceholderText("Nhập mã coupon");
    const user = userEvent.setup();
    await user.type(input, "SAVE20");

    const applyButton = screen.getByText("Áp dụng");
    await user.click(applyButton);

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(mockCoupon, 50000);
    });
  });
});
