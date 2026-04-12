"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-[150px] font-bold text-gray-200 leading-none select-none">
            404
          </h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Trang Không Tìm Thấy
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg">
              <Home className="h-5 w-5 mr-2" />
              Quay Về Trang Chủ
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay Lại
          </Button>
        </div>

        {/* Animated illustration */}
        <div className="mt-12 flex justify-center">
          <svg
            className="w-48 h-48"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
            <path
              d="M70 120C70 120 85 100 100 100C115 100 130 120 130 120"
              stroke="#9ca3af"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="80" cy="85" r="8" fill="#9ca3af" />
            <circle cx="120" cy="85" r="8" fill="#9ca3af" />
          </svg>
        </div>
      </div>
    </div>
  );
}
