"use client";

import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-gray-300 relative overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
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
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-white text-lg relative inline-block">
              Liên Kết Nhanh
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            </h3>
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
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="font-semibold text-white text-lg relative inline-block">
              Dịch Vụ Khách Hàng
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            </h3>
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
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-semibold text-white text-lg relative inline-block">
              Liên Hệ
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            </h3>
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
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 p-8 bg-gradient-to-r from-gray-800/50 via-gray-800 to-gray-800/50 rounded-2xl border border-gray-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Đăng Ký Nhận Tin</h3>
              <p className="text-gray-400">Nhận thông tin về sách mới và ưu đãi đặc biệt</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 md:w-80 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-r-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
                Đăng Ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
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
