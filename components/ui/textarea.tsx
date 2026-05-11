import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-3.5 py-2.5 text-sm",
        "placeholder:text-[var(--color-ink-4)]",
        "transition-all duration-100",
        "focus-visible:outline-none focus-visible:border-[var(--color-brand-1)] focus-visible:ring-[3px] focus-visible:ring-[var(--color-brand-softer)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-subtle)]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
