import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

const setLocaleMock = vi.fn();

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    setLocale: setLocaleMock,
    isLoading: false,
  }),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/products");
  });

  it("updates locale state without rewriting the pathname", () => {
    const originalPathname = window.location.pathname;

    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /switch language/i }));
    fireEvent.click(screen.getByRole("option", { name: /english/i }));

    expect(setLocaleMock).toHaveBeenCalledWith("en");
    expect(window.location.pathname).toBe(originalPathname);
  });
});
