"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => undefined)
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });
    }
  }, []);

  return null;
}
