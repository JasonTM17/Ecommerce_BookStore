import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    t: (key: string) =>
      (
        {
          "footer.ariaLabel": "Chân trang website",
          "footer.brandHeading": "Giới thiệu về BookStore",
          "footer.brandDescription":
            "Nền tảng thương mại điện tử chuyên sách với trải nghiệm mua sắm hiện đại.",
          "footer.projectLinks": "Liên kết nhanh",
          "footer.contact": "Liên hệ",
          "footer.projectAbout": "Về dự án",
          "footer.support": "Hỗ trợ",
          "footer.customerService": "Dịch vụ khách hàng",
          "footer.newsletterTitle": "Đăng ký nhận tin",
          "footer.newsletterDescription": "Nhận thông tin về sách mới và ưu đãi nổi bật.",
          "footer.newsletterInput": "Nhập email để đăng ký nhận tin",
          "footer.newsletterSubmit": "Đăng ký nhận tin",
          "footer.newsletterConfirmation":
            "Ứng dụng email của bạn đã được mở để hoàn tất đăng ký nhận tin.",
          "footer.newsletterSubject": "Đăng ký nhận tin từ BookStore",
          "footer.newsletterBody":
            "Xin chào BookStore,\r\nTôi muốn đăng ký nhận bản tin với email: {email}",
          "footer.address": "123 Đường ABC, Quận 1, TP.HCM",
          "footer.businessHours": "Thứ 2 - Thứ 7: 8:00 - 20:00",
          "footer.copyright": "Tất cả quyền được bảo lưu.",
          "footer.portfolioBy": "Dự án portfolio bởi",
          "nav.products": "Sản phẩm",
          "nav.categories": "Danh mục",
          "nav.about": "Giới thiệu",
          "nav.contact": "Liên hệ",
          "nav.blog": "Blog",
          "nav.faq": "FAQ",
          "nav.shipping": "Giao hàng",
          "nav.returns": "Đổi trả",
          "nav.privacy": "Bảo mật",
          "nav.terms": "Điều khoản",
        } as Record<string, string>
      )[key] ?? key,
  }),
}));

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
