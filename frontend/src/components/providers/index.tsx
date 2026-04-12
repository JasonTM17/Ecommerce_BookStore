"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./auth-provider";
import { LanguageProvider } from "./language-provider";
import { useKeyboardShortcuts } from "@/components/a11y/useKeyboardShortcuts";
import type { Locale } from "@/lib/i18n";

function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return null;
}

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
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
        <LanguageProvider initialLocale={initialLocale}>
          <KeyboardShortcutsProvider />
          {children}
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
