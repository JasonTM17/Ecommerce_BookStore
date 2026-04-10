"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes - data is considered fresh
            staleTime: 5 * 60 * 1000,
            // GC time: 10 minutes - keep unused data in memory
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 2 times
            retry: 2,
            // Don't refetch on window focus in production
            refetchOnWindowFocus:
              process.env.NODE_ENV === "development" ? true : false,
            // Don't refetch on reconnect
            refetchOnReconnect: "always",
            // Dedupe requests within 2 seconds
            structuralSharing: true,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}