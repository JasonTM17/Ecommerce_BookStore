import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaticInfoPageShell } from "@/components/static-info-page";

let currentLocale: "vi" | "en" = "vi";

vi.mock("@/lib/i18n/server", () => ({
  getRequestLocale: () => currentLocale,
}));

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

describe("StaticInfoPageShell", () => {
  beforeEach(() => {
    currentLocale = "vi";
  });

  it("renders a localized home breadcrumb label", async () => {
    const renderShell = () =>
      StaticInfoPageShell({
        accentClassName: "from-blue-900 to-indigo-900",
        badgeText: "Badge",
        children: <div>Child</div>,
        description: "Description",
        icon: <span aria-hidden="true">i</span>,
        title: "Title",
      });

    const { rerender } = render(await renderShell());

    expect(screen.getByRole("link", { name: "Trang chủ" })).toBeInTheDocument();

    currentLocale = "en";
    rerender(await renderShell());

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
