import { describe, expect, it } from "vitest";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";

describe("publicWarmupQueryOptions", () => {
  it("retries retryable axios warm-up errors only within the bounded window", () => {
    expect(
      publicWarmupQueryOptions.retry(0, {
        isAxiosError: true,
        response: { status: 502 },
      }),
    ).toBe(true);

    expect(
      publicWarmupQueryOptions.retry(2, {
        isAxiosError: true,
        response: { status: 503 },
      }),
    ).toBe(true);

    expect(
      publicWarmupQueryOptions.retry(3, {
        isAxiosError: true,
        response: { status: 503 },
      }),
    ).toBe(false);
  });

  it("does not retry non-axios or non-retryable client errors", () => {
    expect(publicWarmupQueryOptions.retry(0, new Error("boom"))).toBe(false);

    expect(
      publicWarmupQueryOptions.retry(0, {
        isAxiosError: true,
        response: { status: 404 },
      }),
    ).toBe(false);
  });
});
