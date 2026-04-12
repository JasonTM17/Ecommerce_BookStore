import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { CouponCard } from "@/components/coupon/CouponCard";

const coupon = {
  id: 7,
  code: "SAVE15",
  description: "Giảm 15% cho đơn hàng sách kỹ năng",
  type: "PERCENTAGE",
  discountValue: 15,
  discountDisplay: "Giảm 15%",
  minOrderAmount: 200000,
  maxDiscount: 50000,
  startDate: "2026-04-01T00:00:00.000Z",
  endDate: "2026-04-30T23:59:59.000Z",
  usageLimit: 100,
  usedCount: 10,
};

describe("CouponCard", () => {
  it("does not advertise clickability when no selection handler is provided", () => {
    const { container } = render(<CouponCard coupon={coupon} />);
    const card = container.firstElementChild as HTMLElement;

    fireEvent.click(card);

    expect(card.className).toContain("cursor-default");
    expect(card.className).not.toContain("cursor-pointer");
  });

  it("calls onSelect when the card is selectable", () => {
    const onSelect = vi.fn();
    const { container } = render(<CouponCard coupon={coupon} onSelect={onSelect} />);
    const card = container.firstElementChild as HTMLElement;

    fireEvent.click(card);

    expect(card.className).toContain("cursor-pointer");
    expect(onSelect).toHaveBeenCalledWith(coupon);
  });
});
