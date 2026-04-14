"use client";

import { useEffect, useState, type ComponentProps } from "react";
import Image from "next/image";

type ProductImageProps = Omit<ComponentProps<typeof Image>, "src"> & {
  src?: string | null;
  fallbackSrc: string;
};

export function ProductImage({
  src,
  fallbackSrc,
  alt,
  ...props
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [fallbackSrc, src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
