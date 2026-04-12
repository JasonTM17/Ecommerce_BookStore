"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Mail, Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) {
      return;
    }

    const subject = encodeURIComponent("Đăng ký nhận tin từ BookStore");
    const body = encodeURIComponent(
      `Xin chào BookStore,\r\nTôi muốn đăng ký nhận bản tin với email: ${email}`
    );

    window.open(`mailto:contact@bookstore.com?subject=${subject}&body=${body}`, "_self");
    setNewsletterSubmitted(true);
  };

  return (
    <footer
      role="contentinfo"
      className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-gray-300 relative overflow-hidden"
      aria-label="Chân trang website"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6" role="region" aria-labelledby="footer-brand">
            <h2 id="footer-brand" className="sr-only">Giới thiệu về BookStore</h2>
            <Link href="/" className="flex items-center group">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <span className="ml-3 font-bold text-xl text-white group-hover:text-blue-400 transition-colors">
                BookStore
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Nền tảng thương mại điện tử hàng đầu Việt Nam về sách và tài liệu.
              Mua sắm dễ dàng, giao hàng nhanh chóng.
            </p>
            <div className="flex flex-wrap gap-3" aria-label="Liên kết giới thiệu và hỗ trợ">
              {[
                { href: "/about", label: "Về dự án" },
                { href: "/contact", label: "Liên hệ" },
                { href: "/faq", label: "Hỗ trợ" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <nav aria-labelledby="footer-nav-heading" className="space-y-6">
            <h2 id="footer-nav-heading" className="font-semibold text-white text-lg relative inline-block">
              Liên Kết Nhanh
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            </h2>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "Sản Phẩm" },
                { href: "/categories", label: "Danh Mục" },
                { href: "/about", label: "Giới Thiệu" },
                { href: "/contact", label: "Liên Hệ" },
                { href: "/blog", label: "Blog" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-blue-500 mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-service-heading" className="space-y-6">
            <h2 id="footer-service-heading" className="font-semibold text-white text-lg relative inline-block">
              Dịch Vụ Khách Hàng
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            </h2>
            <ul className="space-y-3">
              {[
                { href: "/faq", label: "Câu Hỏi Thường Gặp" },
                { href: "/shipping", label: "Chính Sách Giao Hàng" },
                { href: "/returns", label: "Chính Sách Đổi Trả" },
                { href: "/privacy", label: "Chính Sách Bảo Mật" },
                { href: "/terms", label: "Điều Khoản Sử Dụng" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-blue-500 mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading" className="space-y-6">
            <h2 id="footer-contact-heading" className="font-semibold text-white text-lg relative inline-block">
              Liên Hệ
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 group-hover:bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <MapPin className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 group-hover:bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Phone className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">0901 234 567</span>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 group-hover:bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Mail className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">contact@bookstore.com</span>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 group-hover:bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Clock className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Thứ 2 - Thứ 7: 8:00 - 20:00</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-gray-800/50 via-gray-800 to-gray-800/50 rounded-2xl border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-2">Đăng Ký Nhận Tin</h2>
          <p className="text-gray-400 mb-4">Nhận thông tin về sách mới và ưu đãi đặc biệt</p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubmit}>
            <label htmlFor="newsletter-email" className="sr-only">Email của bạn</label>
            <input
              id="newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                if (newsletterSubmitted) {
                  setNewsletterSubmitted(false);
                }
              }}
              required
              placeholder="Nhập email của bạn"
              aria-label="Nhập email để đăng ký nhận tin"
              className="flex-1 sm:flex-none sm:w-80 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all duration-300"
            />
            <button
              type="submit"
              aria-label="Đăng ký nhận tin"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Đăng Ký
            </button>
          </form>
          {newsletterSubmitted ? (
            <p className="mt-3 text-sm text-blue-300" data-testid="newsletter-confirmation">
              Ứng dụng email của bạn đã được mở để hoàn tất đăng ký nhận tin.
            </p>
          ) : null}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} <span className="text-blue-500">BookStore</span>. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-gray-500 text-sm">
              Dự án portfolio bởi <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Nguyễn Sơn</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
