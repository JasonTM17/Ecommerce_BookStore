import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FlashSaleCountdownCard } from "@/components/flashsale/FlashSaleCountdownCard";

describe("FlashSaleCountdownCard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses offset timestamps and emits onExpire when the sale ends", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-04-15T08:59:58.000Z"));

    const onExpire = vi.fn();

    render(
      <FlashSaleCountdownCard
        locale="vi"
        endTime="2099-04-15T16:00:00+07:00"
        remainingStock={5}
        maxPerUser={2}
        onExpire={onExpire}
      />,
    );

    expect(screen.getByTestId("flash-sale-countdown-seconds")).toHaveTextContent(
      "02",
    );

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
