import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium font-mono tracking-[0.04em] uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--color-bg-sunken)] text-[var(--color-ink-2)]",
        ink: "bg-[var(--color-ink)] text-[var(--color-bg)]",
        brand: "bg-brand-grad text-white",
        "brand-soft": "bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]",
        ok: "bg-[var(--color-ok-soft)] text-[var(--color-ok)] border border-[var(--color-ok)]/15",
        warn: "bg-[var(--color-warn-soft)] text-[var(--color-warn)] border border-[var(--color-warn)]/20",
        danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",
        info: "bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/15",
        outline: "border border-[var(--color-hair)] text-[var(--color-ink-2)] bg-transparent",
        primary: "bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]",
        accent: "bg-[var(--color-warn-soft)] text-[var(--color-warn)]",
        success: "bg-[var(--color-ok-soft)] text-[var(--color-ok)]",
      },
      dot: {
        true: "before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:opacity-70",
        false: "",
      },
    },
    defaultVariants: { tone: "neutral", dot: false },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, dot, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, dot }), className)} {...props} />;
}
