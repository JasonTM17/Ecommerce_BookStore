import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("renders canonical links for public info and shopping routes", () => {
    render(<Footer />);

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter(Boolean);

    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/",
        "/products",
        "/categories",
        "/about",
        "/contact",
        "/blog",
        "/faq",
        "/shipping",
        "/returns",
        "/privacy",
        "/terms",
      ])
    );
    expect(hrefs).not.toContain("#");
  });
});
