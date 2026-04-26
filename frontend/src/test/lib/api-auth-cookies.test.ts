import { beforeEach, describe, expect, it, vi } from "vitest";

vi.unmock("@/lib/api");

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  cookieRemove: vi.fn(),
  axiosRequest: vi.fn(),
  axiosPost: vi.fn(),
  axiosInstance: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock("js-cookie", () => ({
  default: {
    get: mocks.cookieGet,
    set: mocks.cookieSet,
    remove: mocks.cookieRemove,
  },
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mocks.axiosInstance),
    request: mocks.axiosRequest,
    post: mocks.axiosPost,
  },
}));

describe("auth cookie helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets auth cookies with constrained browser flags", async () => {
    const { setAuthTokens } = await import("@/lib/api");

    setAuthTokens("access-token", "refresh-token");

    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "access_token",
      "access-token",
      {
        expires: 1,
        path: "/",
        sameSite: "Lax",
        secure: false,
      },
    );
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "refresh_token",
      "refresh-token",
      {
        expires: 7,
        path: "/",
        sameSite: "Lax",
        secure: false,
      },
    );
  });

  it("removes auth cookies with the app-wide path", async () => {
    const { clearAuthTokens } = await import("@/lib/api");

    clearAuthTokens();

    expect(mocks.cookieRemove).toHaveBeenCalledWith("access_token", {
      path: "/",
    });
    expect(mocks.cookieRemove).toHaveBeenCalledWith("refresh_token", {
      path: "/",
    });
  });
});
