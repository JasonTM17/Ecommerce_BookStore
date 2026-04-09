import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton rounded-md bg-muted ${className}`}
      {...props}
    />
  );
}

export { Skeleton };
