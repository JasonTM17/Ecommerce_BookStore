"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ChevronRight, Shield, Lock, Eye, UserCheck, FileText, AlertCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 text-sm text-green-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <ChevronRight className="w-4 h-4" />
              <span>Chính sách bảo mật</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Chính Sách Bảo Mật</h1>
                <p className="text-green-200">Cập nhật lần cuối: 01/01/2024</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Intro Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cam kết bảo mật của chúng tôi</h2>
                    <p className="text-gray-600 leading-relaxed">
                      BookStore cam kết bảo vệ thông tin cá nhân của bạn. Chúng tôi thu thập, sử dụng và bảo vệ 
                      dữ liệu của bạn theo đúng quy định của pháp luật Việt Nam, bao gồm Luật An ninh mạng 
                      và Luật Bảo vệ dữ liệu cá nhân.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">1. Thông tin chúng tôi thu thập</h2>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      Khi bạn đăng ký và sử dụng dịch vụ của BookStore, chúng tôi có thể thu thập các thông tin sau:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">Thông tin cá nhân</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Họ và tên</li>
                          <li>• Địa chỉ email</li>
                          <li>• Số điện thoại</li>
                          <li>• Địa chỉ giao hàng</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">Thông tin tài khoản</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Tên đăng nhập</li>
                          <li>• Mật khẩu (đã mã hóa)</li>
                          <li>• Lịch sử đơn hàng</li>
                          <li>• Lịch sử thanh toán</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">2. Mục đích sử dụng thông tin</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Chúng tôi sử dụng thông tin cá nhân của bạn cho các mục đích sau:
                  </p>
                  <div className="grid gap-3">
                    {[
                      { title: "Xử lý đơn hàng", desc: "Giao hàng, xác nhận và theo dõi đơn hàng" },
                      { title: "Hỗ trợ khách hàng", desc: "Trả lời câu hỏi, giải quyết khiếu nại" },
                      { title: "Cải thiện dịch vụ", desc: "Phân tích dữ liệu để nâng cao chất lượng" },
                      { title: "Marketing", desc: "Gửi thông tin khuyến mãi (với sự đồng ý của bạn)" },
                      { title: "Bảo mật", desc: "Phát hiện và ngăn chặn gian lận" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">3. Bảo mật thông tin</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Chúng tôi áp dụng các biện pháp bảo mật sau để bảo vệ thông tin của bạn:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: "🔐", title: "Mã hóa SSL", desc: "Dữ liệu được mã hóa khi truyền tải" },
                      { icon: "🛡️", title: "Firewall", desc: "Bảo vệ khỏi tấn công mạng" },
                      { icon: "🔑", title: "Mã hóa mật khẩu", desc: "Sử dụng bcrypt để bảo vệ mật khẩu" },
                      { icon: "🔄", title: "Sao lưu dữ liệu", desc: "Backup định kỳ để đảm bảo an toàn" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">4. Chia sẻ thông tin</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Chúng tôi cam kết không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba 
                    khi chưa có sự đồng ý của bạn, trừ các trường hợp sau:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Đối tác vận chuyển để giao hàng cho bạn</li>
                    <li>Cơ quan chức năng khi có yêu cầu theo quy định pháp luật</li>
                    <li>Nhà cung cấp dịch vụ thanh toán để xử lý giao dịch</li>
                    <li>Bảo vệ quyền lợi của BookStore trong trường hợp vi phạm điều khoản</li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">5. Quyền của bạn</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Bạn có các quyền sau đối với thông tin cá nhân của mình:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Truy cập", desc: "Xem thông tin cá nhân của bạn" },
                      { title: "Chỉnh sửa", desc: "Cập nhật hoặc sửa đổi thông tin" },
                      { title: "Xóa", desc: "Yêu cầu xóa tài khoản và dữ liệu" },
                      { title: "Phản đối", desc: "Từ chối xử lý dữ liệu cho marketing" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold">{i + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 6 - Cookies */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                      🍪
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">6. Cookies</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Chúng tôi sử dụng cookies để:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                    <li>Ghi nhớ thông tin đăng nhập và tùy chọn của bạn</li>
                    <li>Phân tích lưu lượng truy cập website</li>
                    <li>Cung cấp trải nghiệm mua sắm cá nhân hóa</li>
                    <li>Hiển thị quảng cáo phù hợp với sở thích của bạn</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    Bạn có thể từ chối cookies trong cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng 
                    đến một số chức năng của website.
                  </p>
                </div>

                {/* Contact */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Liên hệ với chúng tôi</h2>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc muốn thực hiện 
                        các quyền của mình, vui lòng liên hệ:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="font-medium text-gray-900">📧 Email</p>
                          <p className="text-blue-600">privacy@bookstore.com</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="font-medium text-gray-900">📞 Hotline</p>
                          <p className="text-blue-600">0901 234 567</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
