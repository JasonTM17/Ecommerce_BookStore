import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import AboutPage from "@/app/about/page";
import BlogPage from "@/app/blog/page";
import ContactPage from "@/app/contact/page";
import FaqPage from "@/app/faq/page";
import PrivacyPage from "@/app/privacy/page";
import ReturnsPage from "@/app/returns/page";
import ShippingPage from "@/app/shipping/page";
import TermsPage from "@/app/terms/page";

let currentLocale: "vi" | "en" = "vi";

vi.mock("@/lib/i18n/server", () => ({
  getRequestLocale: () => currentLocale,
}));

vi.mock("@/components/static-info-page", () => ({
  StaticInfoPageShell: ({
    children,
    title,
  }: {
    children: ReactNode;
    title: string;
  }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

vi.mock("@/components/layout/header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <div>Footer</div>,
}));

const pages: Array<{
  component: () => Promise<ReactElement>;
  viHeading: string;
  enHeading: string;
}> = [
  {
    component: AboutPage,
    viHeading: "Giới thiệu BookStore",
    enHeading: "About BookStore",
  },
  {
    component: ContactPage,
    viHeading: "Liên hệ BookStore",
    enHeading: "Contact BookStore",
  },
  {
    component: BlogPage,
    viHeading: "Blog BookStore",
    enHeading: "BookStore Blog",
  },
  {
    component: FaqPage,
    viHeading: "Câu hỏi thường gặp",
    enHeading: "Frequently Asked Questions",
  },
  {
    component: PrivacyPage,
    viHeading: "Chính sách bảo mật",
    enHeading: "Privacy policy",
  },
  {
    component: TermsPage,
    viHeading: "Điều khoản sử dụng",
    enHeading: "Terms of use",
  },
  {
    component: ShippingPage,
    viHeading: "Chính sách giao hàng",
    enHeading: "Shipping policy",
  },
  {
    component: ReturnsPage,
    viHeading: "Chính sách đổi trả",
    enHeading: "Returns policy",
  },
];

describe("localized info pages", () => {
  beforeEach(() => {
    currentLocale = "vi";
  });

  it.each(pages)(
    "renders Vietnamese and English headings for %s",
    async ({ component, viHeading, enHeading }) => {
      const Page = component;

      const { rerender } = render(await Page());
      expect(
        screen.getByRole("heading", { name: viHeading }),
      ).toBeInTheDocument();

      currentLocale = "en";
      rerender(await Page());
      expect(
        screen.getByRole("heading", { name: enHeading }),
      ).toBeInTheDocument();
    },
  );
});
