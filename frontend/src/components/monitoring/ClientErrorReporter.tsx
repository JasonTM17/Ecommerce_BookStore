"use client";

import { useEffect } from "react";
import { logClientError } from "@/lib/monitoring";

export function ClientErrorReporter() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logClientError({
        component: "window.error",
        message: event.message || "Unhandled browser error",
        name: event.error?.name,
        stack: event.error?.stack,
        metadata: {
          column: event.colno,
          line: event.lineno,
          source: event.filename,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      logClientError({
        component: "window.unhandledrejection",
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === "string"
              ? reason
              : "Unhandled promise rejection",
        name: reason instanceof Error ? reason.name : undefined,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
