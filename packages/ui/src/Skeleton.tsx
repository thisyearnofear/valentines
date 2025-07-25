import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const skeleton = cva(
  "animate-pulse rounded bg-gray-200 dark:bg-gray-700",
  {
    variants: {
      size: {
        md: "h-6 w-40",
        lg: "h-8 w-64",
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeleton> {}

export function Skeleton({ size, className, ...props }: SkeletonProps) {
  return <div className={clsx(skeleton({ size }), className)} {...props} />;
}