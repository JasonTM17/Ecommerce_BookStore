import type { Product } from "@/lib/types";

const LOCAL_BOOK_ASSET_PREFIX = "/images/books/";
const LOCAL_FALLBACK_COVERS = [
  "/images/books/covers/9780061120084-L.jpg",
  "/images/books/covers/9780132350884-L.jpg",
  "/images/books/covers/9780134093413-L.jpg",
  "/images/books/covers/9780141439518-L.jpg",
  "/images/books/covers/9780345539434-L.jpg",
  "/images/books/covers/9780525540830-L.jpg",
  "/images/books/covers/9780735211292-L.jpg",
  "/images/books/covers/9780743273565-L.jpg",
  "/images/books/covers/9781591848011-L.jpg",
  "/images/books/covers/9781612680194-L.jpg",
  "/images/books/vietnamese/mau_sac_cam_xuc.png",
  "/images/books/vietnamese/so_tay_sang_tao.png",
];

const PLACEHOLDER_BY_CATEGORY: Record<string, string> = {
  "sach-van-hoc": "/images/books/placeholders/literature.svg",
  "tieu-thuyet": "/images/books/placeholders/literature.svg",
  "truyen-ngan": "/images/books/placeholders/literature.svg",
  tho: "/images/books/placeholders/literature.svg",
  "van-hoc-co-dien": "/images/books/placeholders/literature.svg",
  "sach-ngoai-van": "/images/books/placeholders/literature.svg",
  "kinh-te": "/images/books/placeholders/business.svg",
  marketing: "/images/books/placeholders/business.svg",
  "tai-chinh": "/images/books/placeholders/business.svg",
  "lanh-dao": "/images/books/placeholders/business.svg",
  "khoa-hoc": "/images/books/placeholders/science.svg",
  "khoa-hoc-tu-nhien": "/images/books/placeholders/science.svg",
  "cong-nghe": "/images/books/placeholders/science.svg",
  "sach-giao-khoa": "/images/books/placeholders/science.svg",
  "phat-trien-ban-than": "/images/books/placeholders/self-help.svg",
  "sach-thieu-nhi": "/images/books/placeholders/children.svg",
  "lich-su": "/images/books/placeholders/history.svg",
  "am-thuc": "/images/books/placeholders/cooking.svg",
  "nghe-thuat": "/images/books/placeholders/art.svg",
};

type ProductLike =
  | (Pick<Product, "imageUrl" | "images" | "category"> &
      Partial<Pick<Product, "id">>)
  | null
  | undefined;

function slugifyCategoryName(categoryName?: string | null): string {
  if (!categoryName) {
    return "";
  }

  return categoryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function uniqueCandidates(
  candidates: Array<string | null | undefined>,
): string[] {
  return Array.from(
    new Set(
      candidates.filter((candidate): candidate is string =>
        Boolean(candidate && candidate.trim()),
      ),
    ),
  );
}

export function getCategoryPlaceholderImage(
  categoryName?: string | null,
): string {
  const key = slugifyCategoryName(categoryName);
  return (
    PLACEHOLDER_BY_CATEGORY[key] || "/images/books/placeholders/default.svg"
  );
}

export function isLocalBookAssetPath(src?: string | null): boolean {
  return Boolean(src && src.startsWith(LOCAL_BOOK_ASSET_PREFIX));
}

function isPlaceholderAssetPath(src?: string | null): boolean {
  return Boolean(src && src.includes("/images/books/placeholders/"));
}

export function getDeterministicBookCover(productId?: number | null): string {
  if (typeof productId !== "number") {
    return "";
  }

  return LOCAL_FALLBACK_COVERS[
    Math.abs(productId) % LOCAL_FALLBACK_COVERS.length
  ];
}

export function resolveProductFallbackImage(product?: ProductLike): string {
  return (
    getDeterministicBookCover(product?.id) ||
    getCategoryPlaceholderImage(product?.category?.name)
  );
}

export function resolveProductImageSource(product?: ProductLike): string {
  const fallback = resolveProductFallbackImage(product);
  const candidates = uniqueCandidates([
    ...(product?.images ?? []),
    product?.imageUrl,
  ]);
  const localCoverCandidate = candidates.find(
    (candidate) =>
      candidate.startsWith("/") && !isPlaceholderAssetPath(candidate),
  );
  if (localCoverCandidate) {
    return localCoverCandidate;
  }

  const remoteCandidate = candidates.find(
    (candidate) =>
      !candidate.startsWith("/") && !isPlaceholderAssetPath(candidate),
  );
  if (remoteCandidate) {
    return remoteCandidate;
  }

  return fallback;
}
