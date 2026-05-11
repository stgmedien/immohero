import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((crumb, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-1">
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={cn(isLast ? "text-[var(--color-ink)] font-medium" : "text-[var(--color-ink-3)]")}>
                {crumb.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-[var(--color-ink-4)]" />}
          </div>
        );
      })}
    </nav>
  );
}
