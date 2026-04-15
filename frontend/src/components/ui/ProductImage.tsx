"use client";

import { useEffect, useState, type ComponentProps } from "react";
import Image from "next/image";
import { isLocalBookAssetPath } from "@/lib/product-images";

type ProductImageProps = Omit<ComponentProps<typeof Image>, "src"> & {
  src?: string | null;
  fallbackSrc: string;
};

export function ProductImage({
  src,
  fallbackSrc,
  alt,
  unoptimized,
  ...props
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const isSvgSource = currentSrc?.toLowerCase().endsWith(".svg");
  const shouldSkipOptimization =
    typeof unoptimized === "boolean"
      ? unoptimized
      : isSvgSource || isLocalBookAssetPath(currentSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [fallbackSrc, src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      decoding="async"
      unoptimized={shouldSkipOptimization || undefined}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
