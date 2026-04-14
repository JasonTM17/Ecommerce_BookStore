"use client";

import Link from "next/link";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApiStatusCardProps {
  title: string;
  description: string;
  retryLabel: string;
  onRetry?: () => void;
  primaryHref?: string;
  primaryLabel?: string;
  compact?: boolean;
}

export function ApiStatusCard({
  title,
  description,
  retryLabel,
  onRetry,
  primaryHref,
  primaryLabel,
  compact = false,
}: ApiStatusCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-amber-200 bg-amber-50/80 text-center shadow-sm",
        compact ? "px-6 py-8" : "px-8 py-16",
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3
        className={cn(
          "font-semibold text-gray-900",
          compact ? "text-xl" : "text-2xl",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mx-auto mt-2 text-gray-600",
          compact ? "max-w-xl" : "max-w-2xl",
        )}
      >
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="rounded-xl">
            <RefreshCcw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        )}
        {primaryHref && primaryLabel && (
          <Link href={primaryHref}>
            <Button variant="outline" className="rounded-xl">
              {primaryLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
