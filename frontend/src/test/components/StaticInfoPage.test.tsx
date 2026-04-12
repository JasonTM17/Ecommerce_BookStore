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

  it("renders a localized home breadcrumb label", () => {
    const { rerender } = render(
      <StaticInfoPageShell
        accentClassName="from-blue-900 to-indigo-900"
        badgeText="Badge"
        description="Description"
        icon={<span aria-hidden="true">i</span>}
        title="Title"
      >
        <div>Child</div>
      </StaticInfoPageShell>
    );

    expect(screen.getByRole("link", { name: "Trang chủ" })).toBeInTheDocument();

    currentLocale = "en";
    rerender(
      <StaticInfoPageShell
        accentClassName="from-blue-900 to-indigo-900"
        badgeText="Badge"
        description="Description"
        icon={<span aria-hidden="true">i</span>}
        title="Title"
      >
        <div>Child</div>
      </StaticInfoPageShell>
    );

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
