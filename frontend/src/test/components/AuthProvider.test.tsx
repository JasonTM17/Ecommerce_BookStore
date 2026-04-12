import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

vi.unmock("@/components/providers/auth-provider");

const useAuthStoreMock = vi.fn();

vi.mock("@/lib/store", () => ({
  useAuthStore: () => useAuthStoreMock(),
}));

import { api } from "@/lib/api";
import { AuthProvider } from "@/components/providers/auth-provider";

describe("AuthProvider", () => {
  const setUser = vi.fn();
  const setLoading = vi.fn();
  const logout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.history.pushState({}, "", "/products");

    useAuthStoreMock.mockReturnValue({
      user: null,
      setUser,
      setLoading,
      logout,
    });
  });

  afterEach(() => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  it("restores the authenticated user when a session cookie exists", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { id: 1, email: "customer@example.com", roles: ["CUSTOMER"] },
    });
    document.cookie = "refresh_token=test-refresh-token; path=/";

    render(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users/me");
    });

    expect(setUser).toHaveBeenCalledWith({
      id: 1,
      email: "customer@example.com",
      roles: ["CUSTOMER"],
    });
    expect(logout).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("skips the auth restore request on auth screens", async () => {
    window.history.pushState({}, "", "/login");

    render(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(setLoading).toHaveBeenCalledWith(false);
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
  });
});
