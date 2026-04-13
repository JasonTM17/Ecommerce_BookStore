import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api/client";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  roles: string[];
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.roles?.includes("MANAGER"));

  const refreshUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          await refreshUser();
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []);

  const persistSession = async (accessToken: string, refreshToken: string, userData: User) => {
    await SecureStore.setItemAsync("access_token", accessToken);
    await SecureStore.setItemAsync("refresh_token", refreshToken);
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user: userData } = response.data;
    await persistSession(accessToken, refreshToken, userData);
  };

  const register = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    const { accessToken, refreshToken, user: userData } = response.data;
    await persistSession(accessToken, refreshToken, userData);
  };

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      await api.post("/auth/logout", refreshToken ? { refreshToken } : undefined);
    } catch {
      // Ignore logout network failures and clear the local session anyway.
    }

    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.put("/users/me", data);
    setUser(response.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, isLoading, login, register, logout, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
