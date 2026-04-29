"use client";

export function SkipLink({
  label = "Chuyển đến nội dung chính",
}: {
  label?: string;
}) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-red-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 transition-all"
    >
      {label}
    </a>
  );
}
