"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./auth-provider";
import { LanguageProvider } from "./language-provider";
import { useKeyboardShortcuts } from "@/components/a11y/useKeyboardShortcuts";

function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: process.env.NODE_ENV === "development",
            refetchOnReconnect: "always",
            structuralSharing: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <KeyboardShortcutsProvider />
          {children}
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
