"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = document.cookie.includes("access_token");
      if (token && !user) {
        try {
          const response = await api.get("/users/me");
          setUser(response.data);
        } catch (error) {
          logout();
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("MANAGER");

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    logout,
  };
}
