"use client";

import { useAuthStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { buildLoginRedirect } from "@/lib/utils";

export function useAuth(requireAuth: boolean = false, requireAdmin: boolean = false) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("MANAGER");
  const hasSessionCookie =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((cookie) => {
      const normalized = cookie.trim();
      return normalized.startsWith("access_token=") || normalized.startsWith("refresh_token=");
    });
  const isRestoringSession = !isAuthenticated && !user && hasSessionCookie;
  const isResolvingAuth = isLoading || isRestoringSession;

  useEffect(() => {
    if (!isResolvingAuth && requireAuth && !isAuthenticated) {
      router.push(buildLoginRedirect(pathname));
    }
    if (!isResolvingAuth && requireAdmin && user && !isAdmin) {
      router.push("/");
    }
  }, [isResolvingAuth, requireAuth, isAuthenticated, requireAdmin, user, isAdmin, router, pathname]);

  return {
    user,
    isAuthenticated,
    isLoading: isResolvingAuth,
    isAdmin,
    logout,
  };
}
