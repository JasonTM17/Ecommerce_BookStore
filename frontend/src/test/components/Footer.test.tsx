import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

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

  it("hands newsletter signup off to the mail client and shows feedback", () => {
    render(<Footer />);

    fireEvent.change(screen.getByLabelText(/nhập email để đăng ký nhận tin/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /đăng ký nhận tin/i }));

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("mailto:contact@bookstore.com?subject="),
      "_self"
    );
    expect(vi.mocked(window.open).mock.calls[0]?.[0]).toContain("demo%40example.com");
    expect(
      screen.getByText(/ứng dụng email của bạn đã được mở để hoàn tất đăng ký nhận tin/i)
    ).toBeInTheDocument();
  });
});
