import { describe, expect, it } from "vitest";
import { buildLoginRedirect } from "@/lib/utils";

describe("buildLoginRedirect", () => {
  it("encodes safe relative redirect targets", () => {
    expect(buildLoginRedirect("/orders/15?tab=details")).toBe(
      "/login?redirect=%2Forders%2F15%3Ftab%3Ddetails"
    );
  });

  it("falls back to the home page for unsafe targets", () => {
    expect(buildLoginRedirect("https://evil.example")).toBe("/login?redirect=%2F");
    expect(buildLoginRedirect("//evil.example")).toBe("/login?redirect=%2F");
    expect(buildLoginRedirect(undefined)).toBe("/login?redirect=%2F");
  });
});
