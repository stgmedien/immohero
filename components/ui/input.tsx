import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-3.5 py-2 text-sm",
          "placeholder:text-[var(--color-ink-4)]",
          "transition-all duration-100",
          "focus-visible:outline-none focus-visible:border-[var(--color-brand-1)] focus-visible:ring-[3px] focus-visible:ring-[var(--color-brand-softer)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-subtle)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
