"use client";

import { useEffect, useRef, useState } from "react";

interface UseAnnouncerOptions {
 Politeness?: "polite" | "assertive";
}

export function useAnnouncer({ Politeness = "polite" }: UseAnnouncerOptions = {}) {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = (text: string, delay = 100) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage("");
    timeoutRef.current = setTimeout(() => {
      setMessage(text);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    announce,
    role: Politeness === "assertive" ? "alert" : "status",
  };
}

export function Announcer({
  message,
  role = "status",
}: {
  message: string;
  role?: "polite" | "assertive";
}) {
  return (
    <div
      role={role}
      aria-live={role}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
