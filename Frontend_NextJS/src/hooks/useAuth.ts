"use client";

import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth: boolean = false, requireAdmin: boolean = false) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && requireAdmin && user && !user.roles?.includes("ADMIN") && !user.roles?.includes("MANAGER")) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireAdmin, router]);

  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("MANAGER");

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    logout,
  };
}
