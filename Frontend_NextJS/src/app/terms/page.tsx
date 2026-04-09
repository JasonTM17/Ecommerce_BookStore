"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ChevronRight, FileText, Scale, AlertCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 text-sm text-blue-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <ChevronRight className="w-4 h-4" />
              <span>Điều khoản sử dụng</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Điều Khoản Sử Dụng</h1>
                <p className="text-blue-200">Cập nhật lần cuối: 01/01/2024</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Table of Contents */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="font-bold text-lg text-gray-900 mb-4">Mục lục</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { num: "1", title: "Giới thiệu" },
                    { num: "2", title: "Tài khoản người dùng" },
                    { num: "3", title: "Mua sắm trên BookStore" },
                    { num: "4", title: "Thanh toán và giá cả" },
                    { num: "5", title: "Vận chuyển và giao hàng" },
                    { num: "6", title: "Đổi trả và hoàn tiền" },
                    { num: "7", title: "Quyền sở hữu trí tuệ" },
                    { num: "8", title: "Giới hạn trách nhiệm" },
                  ].map((item) => (
                    <a key={item.num} href={`#section-${item.num}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {item.num}
                      </span>
                      <span className="text-gray-700 hover:text-blue-600">{item.title}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {/* Section 1 */}
                <div id="section-1" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      1
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Giới thiệu</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Chào mừng bạn đến với BookStore - nền tảng thương mại điện tử hàng đầu Việt Nam về sách và tài liệu. 
                      Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện 
                      được nêu trong tài liệu này.
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4">
                      Bằng việc đăng ký tài khoản hoặc tiếp tục sử dụng website, bạn xác nhận rằng bạn đã đọc, hiểu 
                      và đồng ý với tất cả các điều khoản dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào của 
                      các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                    </p>
                  </div>
                </div>

                {/* Section 2 */}
                <div id="section-2" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold">
                      2
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Tài khoản người dùng</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Để tham gia mua sắm trên BookStore, bạn cần đăng ký tài khoản với thông tin chính xác và đầy đủ.
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                      <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình</li>
                      <li>Bạn phải từ đủ 18 tuổi hoặc có sự đồng ý của cha mẹ/người giám hộ</li>
                      <li>Bạn cam kết thông tin đăng ký là trung thực và chính xác</li>
                      <li>Mỗi người chỉ được phép đăng ký một tài khoản duy nhất</li>
                      <li>Chúng tôi có quyền tạm ngừng hoặc xóa tài khoản vi phạm điều khoản</li>
                    </ul>
                  </div>
                </div>

                {/* Section 3 */}
                <div id="section-3" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                      3
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Mua sắm trên BookStore</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Khi đặt hàng trên BookStore, bạn cam kết:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                      <li>Đặt hàng với mục đích sử dụng hợp pháp</li>
                      <li>Không đặt hàng với số lượng lớn để kinh doanh lại</li>
                      <li>Cung cấp thông tin giao hàng chính xác và đầy đủ</li>
                      <li>Thanh toán đúng hạn cho các đơn hàng đã đặt</li>
                    </ul>
                  </div>
                </div>

                {/* Section 4 */}
                <div id="section-4" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center font-bold">
                      4
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Thanh toán và giá cả</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Chúng tôi chấp nhận các phương thức thanh toán sau:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                      <li>Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)</li>
                      <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
                      <li>Chuyển khoản ngân hàng</li>
                      <li>Thanh toán khi nhận hàng (COD)</li>
                    </ul>
                    <p className="text-gray-600 leading-relaxed mt-4">
                      Giá sản phẩm trên website đã bao gồm VAT. Chúng tôi bảo lưu quyền thay đổi giá 
                      mà không cần thông báo trước.
                    </p>
                  </div>
                </div>

                {/* Section 5 */}
                <div id="section-5" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                      5
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Vận chuyển và giao hàng</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Chúng tôi cung cấp dịch vụ giao hàng toàn quốc với các mức phí:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                      <li>Miễn phí vận chuyển cho đơn hàng từ 200.000 VNĐ</li>
                      <li>Phí vận chuyển 25.000 - 45.000 VNĐ cho đơn hàng dưới 200.000 VNĐ</li>
                      <li>Thời gian giao hàng: 2-5 ngày làm việc tùy khu vực</li>
                      <li>Đơn hàng được xử lý trong 24 giờ làm việc</li>
                    </ul>
                  </div>
                </div>

                {/* Section 6 */}
                <div id="section-6" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">
                      6
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Đổi trả và hoàn tiền</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Chính sách đổi trả của chúng tôi:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                      <li>Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
                      <li>Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ phụ kiện</li>
                      <li>Hoàn tiền trong vòng 7-14 ngày làm việc sau khi nhận được sản phẩm</li>
                      <li>Không áp dụng đổi trả cho sách điện tử và sản phẩm giảm giá</li>
                    </ul>
                  </div>
                </div>

                {/* Section 7 */}
                <div id="section-7" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                      7
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Quyền sở hữu trí tuệ</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      Tất cả nội dung trên website BookStore bao gồm văn bản, hình ảnh, logo, thiết kế, 
                      đều thuộc quyền sở hữu của BookStore hoặc các nhà cung cấp nội dung của chúng tôi. 
                      Việc sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép 
                      bằng văn bản là vi phạm pháp luật.
                    </p>
                  </div>
                </div>

                {/* Section 8 */}
                <div id="section-8" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center font-bold">
                      8
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Giới hạn trách nhiệm</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      BookStore không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng 
                      website hoặc dịch vụ của chúng tôi, bao gồm nhưng không giới hạn ở thiệt hại gián tiếp, 
                      đặc biệt, ngẫu nhiên hoặc do hậu quả.
                    </p>
                    <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Liên hệ hỗ trợ</h4>
                          <p className="text-blue-700">
                            Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng liên hệ với 
                            chúng tôi qua email <strong>support@bookstore.com</strong> hoặc hotline <strong>0901 234 567</strong>.
                          </p>
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
