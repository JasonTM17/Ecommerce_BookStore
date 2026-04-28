import type { Brand, Category, PageResponse, Product } from "@/lib/types";

const now = () => Date.now();
const hoursFromNow = (hours: number) =>
  new Date(now() + hours * 60 * 60 * 1000).toISOString();

const rootLiterature: Category = {
  id: 1,
  name: "Sách Văn Học",
  description: "Tiểu thuyết, truyện ngắn và các tác phẩm kinh điển.",
  productCount: 8,
};

const rootBusiness: Category = {
  id: 2,
  name: "Kinh Tế",
  description: "Kinh doanh, tài chính cá nhân và lãnh đạo.",
  productCount: 4,
};

const rootScience: Category = {
  id: 3,
  name: "Khoa Học",
  description: "Khoa học tự nhiên, công nghệ và khám phá tri thức.",
  productCount: 5,
};

const rootSelfHelp: Category = {
  id: 4,
  name: "Phát Triển Bản Thân",
  description: "Kỹ năng sống, thói quen và tư duy hiệu quả.",
  productCount: 5,
};

const rootChildren: Category = {
  id: 5,
  name: "Sách Thiếu Nhi",
  description: "Sách cho trẻ em, gia đình và giáo dục sớm.",
  productCount: 2,
};

const rootHistory: Category = {
  id: 6,
  name: "Lịch Sử",
  description: "Lịch sử, văn hóa và xã hội.",
  productCount: 3,
};

const rootArt: Category = {
  id: 10,
  name: "Nghệ Thuật",
  description: "Mỹ thuật, sáng tạo và cảm hứng thị giác.",
  productCount: 1,
};

const subNovel: Category = {
  id: 11,
  name: "Tiểu Thuyết",
  parentId: 1,
  productCount: 4,
};

const subClassic: Category = {
  id: 12,
  name: "Văn Học Cổ Điển",
  parentId: 1,
  productCount: 4,
};

const subFinance: Category = {
  id: 21,
  name: "Tài Chính",
  parentId: 2,
  productCount: 2,
};

const subLeadership: Category = {
  id: 22,
  name: "Lãnh Đạo",
  parentId: 2,
  productCount: 2,
};

const subNaturalScience: Category = {
  id: 31,
  name: "Khoa Học Tự Nhiên",
  parentId: 3,
  productCount: 3,
};

const subTechnology: Category = {
  id: 32,
  name: "Công Nghệ",
  parentId: 3,
  productCount: 2,
};

const subSkills: Category = {
  id: 41,
  name: "Kỹ Năng Sống",
  parentId: 4,
  productCount: 5,
};

const subPictureBooks: Category = {
  id: 51,
  name: "Sách Tranh",
  parentId: 5,
  productCount: 2,
};

const subWorldHistory: Category = {
  id: 61,
  name: "Lịch Sử Thế Giới",
  parentId: 6,
  productCount: 3,
};

export const demoRootCategories: Category[] = [
  { ...rootLiterature, subcategories: [subNovel, subClassic] },
  { ...rootBusiness, subcategories: [subFinance, subLeadership] },
  { ...rootScience, subcategories: [subNaturalScience, subTechnology] },
  { ...rootSelfHelp, subcategories: [subSkills] },
  { ...rootChildren, subcategories: [subPictureBooks] },
  { ...rootHistory, subcategories: [subWorldHistory] },
  rootArt,
];

export const demoCategories: Category[] = [
  ...demoRootCategories,
  subNovel,
  subClassic,
  subFinance,
  subLeadership,
  subNaturalScience,
  subTechnology,
  subSkills,
  subPictureBooks,
  subWorldHistory,
];

export const demoBrands: Brand[] = [
  { id: 1, name: "Penguin Classics" },
  { id: 2, name: "Harper Business" },
  { id: 3, name: "Portfolio" },
  { id: 4, name: "O'Reilly" },
  { id: 5, name: "NXB Trẻ" },
];

function brand(id: number) {
  return demoBrands.find((item) => item.id === id) || demoBrands[0];
}

type DemoProductInput = Omit<
  Product,
  "currentPrice" | "inStock" | "stockQuantity"
> &
  Partial<Pick<Product, "currentPrice" | "inStock" | "stockQuantity">>;

function product(input: DemoProductInput): Product {
  return {
    ...input,
    stockQuantity: input.stockQuantity ?? 40,
    inStock: input.inStock ?? true,
    currentPrice: input.currentPrice ?? input.discountPrice ?? input.price,
    reviewCount: input.reviewCount ?? 0,
    avgRating: input.avgRating ?? 4.7,
    soldCount: input.soldCount ?? 120,
    updatedAt:
      input.updatedAt ?? new Date(now() - input.id * 3600 * 1000).toISOString(),
  };
}

export const demoProducts: Product[] = [
  product({
    id: 101,
    name: "Atomic Habits",
    author: "James Clear",
    publisher: "Avery",
    price: 189000,
    discountPrice: 151000,
    discountPercent: 20,
    currentPrice: 151000,
    category: subSkills,
    brand: brand(3),
    imageUrl: "/images/books/covers/9780735211292-L.jpg",
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    avgRating: 4.9,
    reviewCount: 238,
    stockQuantity: 64,
  }),
  product({
    id: 102,
    name: "Clean Code",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    price: 329000,
    discountPrice: 279000,
    discountPercent: 15,
    currentPrice: 279000,
    category: subTechnology,
    brand: brand(4),
    imageUrl: "/images/books/covers/9780132350884-L.jpg",
    isFeatured: true,
    isBestseller: true,
    avgRating: 4.8,
    reviewCount: 184,
    stockQuantity: 35,
  }),
  product({
    id: 103,
    name: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    publisher: "Addison-Wesley",
    price: 349000,
    discountPrice: 296000,
    discountPercent: 15,
    currentPrice: 296000,
    category: subTechnology,
    brand: brand(4),
    imageUrl: "/images/books/covers/9780134093413-L.jpg",
    isFeatured: true,
    isNew: true,
    avgRating: 4.8,
    reviewCount: 156,
    stockQuantity: 27,
  }),
  product({
    id: 104,
    name: "Pride and Prejudice",
    author: "Jane Austen",
    publisher: "Penguin Classics",
    price: 159000,
    discountPrice: 127000,
    discountPercent: 20,
    currentPrice: 127000,
    category: subClassic,
    brand: brand(1),
    imageUrl: "/images/books/covers/9780141439518-L.jpg",
    isFeatured: true,
    isBestseller: true,
    avgRating: 4.7,
    reviewCount: 211,
  }),
  product({
    id: 105,
    name: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    publisher: "Scribner",
    price: 149000,
    discountPrice: 119000,
    discountPercent: 20,
    currentPrice: 119000,
    category: subClassic,
    brand: brand(1),
    imageUrl: "/images/books/covers/9780743273565-L.jpg",
    isFeatured: true,
    avgRating: 4.6,
    reviewCount: 187,
  }),
  product({
    id: 106,
    name: "To Kill a Mockingbird",
    author: "Harper Lee",
    publisher: "Harper Perennial",
    price: 169000,
    discountPrice: 139000,
    discountPercent: 18,
    currentPrice: 139000,
    category: subNovel,
    brand: brand(1),
    imageUrl: "/images/books/covers/9780061120084-L.jpg",
    isBestseller: true,
    avgRating: 4.9,
    reviewCount: 248,
  }),
  product({
    id: 107,
    name: "Cosmos",
    author: "Carl Sagan",
    publisher: "Ballantine Books",
    price: 249000,
    discountPrice: 199000,
    discountPercent: 20,
    currentPrice: 199000,
    category: subNaturalScience,
    brand: brand(1),
    imageUrl: "/images/books/covers/9780345539434-L.jpg",
    isFeatured: true,
    isNew: true,
    avgRating: 4.8,
    reviewCount: 144,
  }),
  product({
    id: 108,
    name: "A Brief History of Time",
    author: "Stephen Hawking",
    publisher: "Bantam",
    price: 219000,
    discountPrice: 186000,
    discountPercent: 15,
    currentPrice: 186000,
    category: subNaturalScience,
    brand: brand(1),
    imageUrl: "/images/books/covers/9780553380163-L.jpg",
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 132,
  }),
  product({
    id: 109,
    name: "The Lean Startup",
    author: "Eric Ries",
    publisher: "Crown Business",
    price: 239000,
    discountPrice: 191000,
    discountPercent: 20,
    currentPrice: 191000,
    category: subLeadership,
    brand: brand(2),
    imageUrl: "/images/books/covers/9781591848011-L.jpg",
    images: ["/images/books/covers/9781591848011-L.jpg"],
    isFeatured: true,
    isBestseller: true,
    avgRating: 4.6,
    reviewCount: 119,
  }),
  product({
    id: 110,
    name: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    publisher: "Plata Publishing",
    price: 179000,
    discountPrice: 143000,
    discountPercent: 20,
    currentPrice: 143000,
    category: subFinance,
    brand: brand(2),
    imageUrl: "/images/books/covers/9781612680194-L.jpg",
    isBestseller: true,
    avgRating: 4.6,
    reviewCount: 205,
  }),
  product({
    id: 111,
    name: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    publisher: "Mariner Books",
    price: 99000,
    discountPrice: 79000,
    discountPercent: 20,
    currentPrice: 79000,
    category: subPictureBooks,
    brand: brand(1),
    imageUrl: "/images/books/covers/9780156012195-L.jpg",
    isNew: true,
    avgRating: 4.9,
    reviewCount: 230,
  }),
  product({
    id: 112,
    name: "Sapiens",
    author: "Yuval Noah Harari",
    publisher: "Harper",
    price: 279000,
    discountPrice: 237000,
    discountPercent: 15,
    currentPrice: 237000,
    category: subWorldHistory,
    brand: brand(2),
    imageUrl: "/images/books/covers/9780525540830-L.jpg",
    isFeatured: true,
    isNew: true,
    avgRating: 4.7,
    reviewCount: 172,
  }),
  product({
    id: 113,
    name: "Màu Sắc Cảm Xúc",
    author: "BookStore Studio",
    publisher: "NXB Trẻ",
    price: 129000,
    discountPrice: 99000,
    discountPercent: 23,
    currentPrice: 99000,
    category: subPictureBooks,
    brand: brand(5),
    imageUrl: "/images/books/vietnamese/mau_sac_cam_xuc.png",
    isNew: true,
    avgRating: 4.8,
    reviewCount: 64,
  }),
  product({
    id: 114,
    name: "Sổ Tay Sáng Tạo",
    author: "BookStore Studio",
    publisher: "NXB Trẻ",
    price: 149000,
    discountPrice: 119000,
    discountPercent: 20,
    currentPrice: 119000,
    category: subSkills,
    brand: brand(5),
    imageUrl: "/images/books/vietnamese/so_tay_sang_tao.png",
    isNew: true,
    avgRating: 4.8,
    reviewCount: 58,
  }),
  product({
    id: 115,
    name: "Nhập Môn Hội Họa",
    author: "BookStore Studio",
    publisher: "NXB Trẻ",
    price: 169000,
    discountPrice: 135000,
    discountPercent: 20,
    currentPrice: 135000,
    category: { id: 10, name: "Nghệ Thuật", productCount: 1 },
    brand: brand(5),
    imageUrl: "/images/books/vietnamese/nhap_mon_hoi_hoa.png",
    isNew: true,
    avgRating: 4.7,
    reviewCount: 42,
  }),
  product({
    id: 116,
    name: "Anh Đẹp Quanh Ta",
    author: "BookStore Studio",
    publisher: "NXB Trẻ",
    price: 139000,
    discountPrice: 111000,
    discountPercent: 20,
    currentPrice: 111000,
    category: subNaturalScience,
    brand: brand(5),
    imageUrl: "/images/books/vietnamese/anh_dep_quanh_ta.png",
    isNew: true,
    avgRating: 4.7,
    reviewCount: 36,
  }),
];

function normalizeText(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function sortProducts(products: Product[], sortBy = "newest") {
  const sorted = [...products];
  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
    case "price_desc":
      return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => {
        const left = a.updatedAt ? new Date(a.updatedAt).getTime() : a.id;
        const right = b.updatedAt ? new Date(b.updatedAt).getTime() : b.id;
        return right - left;
      });
  }
}

export function paginateDemoProducts(
  products: Product[],
  page = 0,
  size = 12,
): PageResponse<Product> {
  const totalElements = products.length;
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / Math.max(size, 1));
  const safePage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const start = safePage * size;

  return {
    content: products.slice(start, start + size),
    page: safePage,
    size,
    totalElements,
    totalPages,
    first: safePage === 0,
    last: totalPages === 0 || safePage >= totalPages - 1,
    hasNext: safePage < totalPages - 1,
    hasPrevious: safePage > 0,
  };
}

export function getDemoProductsPage({
  keyword = "",
  categoryId,
  brandId,
  sortBy = "newest",
  page = 0,
  size = 12,
}: {
  keyword?: string;
  categoryId?: string | null;
  brandId?: string | null;
  sortBy?: string;
  page?: number;
  size?: number;
}) {
  const normalizedKeyword = normalizeText(keyword);
  const filtered = demoProducts.filter((item) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [
        item.name,
        item.author,
        item.publisher,
        item.description,
        item.category?.name,
      ]
        .filter(Boolean)
        .some((value) => normalizeText(value).includes(normalizedKeyword));
    const matchesCategory =
      !categoryId ||
      categoryId === "all" ||
      item.category?.id.toString() === categoryId ||
      item.category?.parentId?.toString() === categoryId;
    const matchesBrand =
      !brandId || brandId === "all" || item.brand?.id.toString() === brandId;

    return matchesKeyword && matchesCategory && matchesBrand;
  });

  return paginateDemoProducts(sortProducts(filtered, sortBy), page, size);
}

export function getDemoFeaturedProducts() {
  return demoProducts.filter((item) => item.isFeatured).slice(0, 8);
}

export function getDemoNewProducts() {
  return demoProducts.filter((item) => item.isNew).slice(0, 8);
}

export function getDemoProductsByCategory(
  categoryId: string | null,
  page = 0,
  size = 12,
) {
  if (!categoryId) {
    return paginateDemoProducts([], page, size);
  }

  return getDemoProductsPage({ categoryId, page, size });
}

export type DemoFlashSale = {
  id: number;
  product: {
    id: number;
    name: string;
    author: string;
    imageUrl: string;
    price: number;
    avgRating: number;
    reviewCount: number;
  };
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  startTime: string;
  endTime: string;
  stockLimit: number;
  soldCount: number;
  remainingStock: number;
  isActive: boolean;
  isStarted: boolean;
  isEnded: boolean;
  progress: number;
};

function flashSaleFromProduct(
  item: Product,
  index: number,
  discountPercent: number,
): DemoFlashSale {
  const stockLimit = 40 + index * 8;
  const soldCount = 15 + index * 5;
  const salePrice = Math.round(item.price * (1 - discountPercent / 100));

  return {
    id: 900 + index,
    product: {
      id: item.id,
      name: item.name,
      author: item.author || "BookStore",
      imageUrl: item.imageUrl || "",
      price: item.price,
      avgRating: item.avgRating || 4.7,
      reviewCount: item.reviewCount || 0,
    },
    originalPrice: item.price,
    salePrice,
    discountPercent,
    startTime: hoursFromNow(-1),
    endTime: hoursFromNow(6 + index),
    stockLimit,
    soldCount,
    remainingStock: Math.max(stockLimit - soldCount, 0),
    isActive: true,
    isStarted: true,
    isEnded: false,
    progress: Math.round((soldCount / stockLimit) * 100),
  };
}

export function getDemoActiveFlashSales(): DemoFlashSale[] {
  return [
    flashSaleFromProduct(demoProducts[0], 1, 30),
    flashSaleFromProduct(demoProducts[3], 2, 28),
    flashSaleFromProduct(demoProducts[6], 3, 25),
    flashSaleFromProduct(demoProducts[10], 4, 22),
  ];
}

export function getDemoUpcomingFlashSales(): DemoFlashSale[] {
  return [
    {
      ...flashSaleFromProduct(demoProducts[1], 11, 24),
      id: 950,
      startTime: hoursFromNow(12),
      endTime: hoursFromNow(24),
      isActive: false,
      isStarted: false,
    },
    {
      ...flashSaleFromProduct(demoProducts[12], 12, 26),
      id: 951,
      startTime: hoursFromNow(30),
      endTime: hoursFromNow(42),
      isActive: false,
      isStarted: false,
    },
  ];
}
