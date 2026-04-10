"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        "dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 p-6">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-md rounded-xl border border-white/50">
      <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="h-5 w-20 ml-auto" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function CartSummarySkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
