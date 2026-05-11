import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-tight",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--color-bg-alt)] text-[var(--color-ink-soft)]",
        primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
        accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
        ink: "bg-[var(--color-ink)] text-[var(--color-primary-ink)]",
        success: "bg-[var(--color-primary-soft)] text-[var(--color-success)]",
        warn: "bg-[var(--color-accent-soft)] text-[var(--color-warn)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
