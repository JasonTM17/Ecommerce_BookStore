"use client";

import { useAuthStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { buildLoginRedirect } from "@/lib/utils";

export function useAuth(requireAuth: boolean = false, requireAdmin: boolean = false) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(buildLoginRedirect(pathname));
    }
    if (!isLoading && requireAdmin && user && !user.roles?.includes("ADMIN") && !user.roles?.includes("MANAGER")) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireAdmin, pathname, router]);

  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("MANAGER");

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    logout,
  };
}
