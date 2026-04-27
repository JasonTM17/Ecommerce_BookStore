import { describe, expect, it } from "vitest";
import {
  normalizeProxyTarget,
  resolveProxyTargets,
  resolveProxyTarget,
} from "@/lib/server/api-proxy";

describe("api proxy target resolution", () => {
  it("prefers Render internal hostport when available", () => {
    expect(
      resolveProxyTarget({
        BACKEND_HOSTPORT: "bookstore-api-abcd:10000",
        API_PROXY_TARGET: "https://bookstore-api.onrender.com/api",
      }),
    ).toBe("http://bookstore-api-abcd:10000/api");
  });

  it("returns internal and public targets in fallback order when both are available", () => {
    expect(
      resolveProxyTargets({
        BACKEND_HOSTPORT: "bookstore-api-abcd:10000",
        API_PROXY_TARGET: "https://bookstore-api-a1xl.onrender.com/api",
      }),
    ).toEqual([
      "http://bookstore-api-abcd:10000/api",
      "https://bookstore-api-a1xl.onrender.com/api",
    ]);
  });

  it("falls back to explicit public proxy target", () => {
    expect(
      resolveProxyTarget({
        API_PROXY_TARGET: "https://bookstore-api-a1xl.onrender.com/api",
      }),
    ).toBe("https://bookstore-api-a1xl.onrender.com/api");
  });

  it("uses the public demo backend when no proxy target is configured", () => {
    expect(resolveProxyTarget({})).toBe(
      "https://bookstore-api-a1xl.onrender.com/api",
    );
  });

  it("normalizes missing api suffix", () => {
    expect(
      normalizeProxyTarget("https://bookstore-api-a1xl.onrender.com"),
    ).toBe("https://bookstore-api-a1xl.onrender.com/api");
  });
});
