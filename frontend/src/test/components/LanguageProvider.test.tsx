import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.unmock("@/components/providers/language-provider");

import { LanguageProvider, useLanguage } from "@/components/providers/language-provider";

function LanguageProbe() {
  const { locale, setLocale, isLoading } = useLanguage();

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <button type="button" onClick={() => setLocale("en")}>
        switch
      </button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.history.pushState({}, "", "/products");
  });

  it("hydrates locale from localStorage before cookie fallback", async () => {
    localStorage.setItem("locale", "en");
    document.cookie = "NEXT_LOCALE=vi; path=/";

    render(
      <LanguageProvider initialLocale="vi">
        <LanguageProbe />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
    });

    expect(document.cookie).toContain("NEXT_LOCALE=en");
  });

  it("updates locale state without rewriting the pathname", async () => {
    render(
      <LanguageProvider initialLocale="vi">
        <LanguageProbe />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("vi");
    });

    const originalPathname = window.location.pathname;

    fireEvent.click(screen.getByRole("button", { name: "switch" }));

    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(localStorage.getItem("locale")).toBe("en");
    expect(document.cookie).toContain("NEXT_LOCALE=en");
    expect(window.location.pathname).toBe(originalPathname);
  });
});
