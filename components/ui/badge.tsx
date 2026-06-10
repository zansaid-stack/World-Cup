import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
        secondary: "border-transparent bg-[#D5CFC2] text-foreground hover:bg-[#C4BDB0]",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-[#C4BDB0] text-foreground",
        playoff: "border-transparent bg-amber-500/20 text-amber-400 border border-amber-500/30",
        finals: "border-transparent bg-orange-500/20 text-orange-400 border border-orange-500/30",
        tag: "border-[#C4BDB0] bg-[#DDD7CA] text-muted-foreground hover:bg-[#D5CFC2]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
