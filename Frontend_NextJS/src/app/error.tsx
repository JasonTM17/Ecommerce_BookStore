"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-gray-200 mb-4">500</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi!</h1>
        <p className="text-gray-600 mb-6">
          Rất tiếc, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </a>
        </div>
        {error?.digest && (
          <p className="text-xs text-gray-400 mt-4">Mã lỗi: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
