"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (user) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path === "/login" || path === "/register" || path?.startsWith("/forgot-password")) {
          if (!cancelled) setLoading(false);
          return;
        }
      }

      const cookies = document.cookie.split(";");
      const accessTokenCookie = cookies.find((c) => c.trim().startsWith("access_token="));
      const refreshTokenCookie = cookies.find((c) => c.trim().startsWith("refresh_token="));
      const hasSessionCookie = Boolean(accessTokenCookie || refreshTokenCookie);

      if (!hasSessionCookie) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me");
        if (!cancelled) {
          setUser(response.data);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, setUser } = useAuthStore();

  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("MANAGER");

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    logout,
    setUser,
  };
}
