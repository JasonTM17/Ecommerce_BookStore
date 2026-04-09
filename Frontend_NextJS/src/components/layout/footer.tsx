"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="font-bold text-xl text-white">BookStore</span>
            </div>
            <p className="text-sm text-gray-400">
              Nền tảng thương mại điện tử hàng đầu Việt Nam về sách và tài liệu. 
              Mua sắm dễ dàng, giao hàng nhanh chóng.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Danh Mục
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Giới Thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4">Dịch Vụ Khách Hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Chính Sách Giao Hàng
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Chính Sách Đổi Trả
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Chính Sách Bảo Mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liên Hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
              <li>📞 0901 234 567</li>
              <li>✉️ contact@bookstore.com</li>
              <li>🕐 Thứ 2 - Thứ 7: 8:00 - 20:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} BookStore. Tất cả quyền được bảo lưu.</p>
          <p className="mt-2">Dự án portfolio bởi Nguyễn Sơn</p>
        </div>
      </div>
    </footer>
  );
}
