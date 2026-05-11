import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-grad text-white shadow-[var(--shadow-brand)] hover:brightness-110 active:brightness-95",
        ink:
          "bg-[var(--color-ink)] text-[var(--color-bg)] hover:bg-[var(--color-ink-2)]",
        accent:
          "bg-[var(--color-brand-3)] text-white hover:opacity-90",
        secondary:
          "border border-[var(--color-hair)] bg-[var(--color-bg-elev)] text-[var(--color-ink)] hover:border-[var(--color-ink-4)] hover:bg-[var(--color-bg-subtle)]",
        outline:
          "border border-[var(--color-hair)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-bg-elev)]",
        ghost:
          "text-[var(--color-ink)] hover:bg-black/[0.04] active:bg-black/[0.07]",
        danger:
          "bg-[var(--color-danger)] text-white hover:opacity-90",
        link:
          "text-[var(--color-ink)] underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-3 text-xs",
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-4 text-[13px]",
        lg: "h-11 px-5 text-sm",
        xl: "h-14 px-7 text-base font-semibold",
        icon: "h-8 w-8",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-10 w-10",
      },
      pill: {
        true: "rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      pill: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, pill, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, pill }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
