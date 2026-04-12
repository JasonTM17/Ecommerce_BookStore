import { create } from "zustand";

export interface Product {
  id: number;
  name: string;
  slug?: string;
  author?: string;
  publisher?: string;
  description?: string;
  shortDescription?: string;
  isbn?: string;
  publishedYear?: number;
  pageCount?: number;
  weight?: number;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  currentPrice: number;
  stockQuantity: number;
  inStock: boolean;
  imageUrl?: string;
  images?: string[];
  category?: Category;
  brand?: Brand;
  avgRating?: number;
  reviewCount?: number;
  soldCount?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  parentId?: number;
  subcategories?: Category[];
  productCount?: number;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: string[];
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderStatus: string;
  orderStatusDisplayName: string;
  paymentStatus: string;
  paymentStatusDisplayName: string;
  orderItems: OrderItem[];
  shippingAddress: string;
  shippingPhone: string;
  shippingReceiverName: string;
  shippingMethod?: string;
  shippingFee: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Review {
  id: number;
  user: User;
  rating: number;
  comment?: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscount(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

export function getProductImage(product: Product): string {
  return product.imageUrl || "/placeholder-book.svg";
}
