"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts(enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" or "k" to focus search (except when in input/textarea)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (
        !isInput &&
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey)))
      ) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[name="search"], [data-search-input]'
        );
        if (searchInput) {
          searchInput.focus();
        } else {
          router.push("/products?focus=search");
        }
      }

      // Escape to close modals / go back
      if (e.key === "Escape") {
        const closeBtn = document.activeElement?.closest("[data-modal-close]");
        if (closeBtn) {
          (closeBtn as HTMLButtonElement).click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, router]);
}
