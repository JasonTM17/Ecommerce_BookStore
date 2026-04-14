import { describe, expect, it } from "vitest";
import { normalizeProxyTarget, resolveProxyTarget } from "@/lib/server/api-proxy";

describe("api proxy target resolution", () => {
  it("prefers Render internal hostport when available", () => {
    expect(
      resolveProxyTarget({
        BACKEND_HOSTPORT: "bookstore-api-abcd:10000",
        API_PROXY_TARGET: "https://bookstore-api.onrender.com/api",
      }),
    ).toBe("http://bookstore-api-abcd:10000/api");
  });

  it("falls back to explicit public proxy target", () => {
    expect(
      resolveProxyTarget({
        API_PROXY_TARGET: "https://bookstore-api.onrender.com/api",
      }),
    ).toBe("https://bookstore-api.onrender.com/api");
  });

  it("normalizes missing api suffix", () => {
    expect(normalizeProxyTarget("https://bookstore-api.onrender.com")).toBe(
      "https://bookstore-api.onrender.com/api",
    );
  });
});
